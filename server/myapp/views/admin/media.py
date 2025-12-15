import os
from pathlib import Path

from rest_framework.decorators import api_view, authentication_classes

from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.permission.permission import check_if_demo
from myapp.models import Thing, ThingSku
from server.settings import MEDIA_ROOT


def _safe_join(base_dir, rel_dir):
    base_dir = os.path.abspath(base_dir)
    target = os.path.abspath(os.path.join(base_dir, rel_dir))
    if not target.startswith(base_dir + os.sep) and target != base_dir:
        raise ValueError('invalid path')
    return target


@api_view(['GET'])
@authentication_classes([AdminTokenAuthtication])
def list_api(request):
    """Media list

    params:
      dir=img|file
      type=image|video|all
      keyword=...
      page=1
      pageSize=30
    """

    rel_dir = (request.GET.get('dir') or 'img').strip()
    if rel_dir not in ['img', 'file']:
        rel_dir = 'img'

    ftype = (request.GET.get('type') or 'all').strip().lower()
    keyword = (request.GET.get('keyword') or '').strip().lower()

    try:
        page = int(request.GET.get('page') or 1)
    except Exception:
        page = 1
    try:
        page_size = int(request.GET.get('pageSize') or 30)
    except Exception:
        page_size = 30

    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 30
    if page_size > 200:
        page_size = 200

    base = _safe_join(MEDIA_ROOT, rel_dir)
    if not os.path.isdir(base):
        return APIResponse(code=0, msg='查询成功', data=[], total=0)

    image_ext = {'.jpg', '.jpeg', '.png', '.gif', '.ico', '.webp'}
    video_ext = {'.mp4', '.mov', '.webm'}

    files = []
    for name in os.listdir(base):
        p = os.path.join(base, name)
        if not os.path.isfile(p):
            continue
        ext = Path(name).suffix.lower()
        kind = None
        if ext in image_ext:
            kind = 'image'
        elif ext in video_ext:
            kind = 'video'
        else:
            kind = 'file'

        if ftype != 'all' and kind != ftype:
            continue
        if keyword and keyword not in name.lower():
            continue

        stat = os.stat(p)
        files.append({
            'name': name,
            'dir': rel_dir,
            'type': kind,
            'size': stat.st_size,
            'mtime': int(stat.st_mtime),
        })

    files.sort(key=lambda x: x['mtime'], reverse=True)
    total = len(files)

    start = (page - 1) * page_size
    end = start + page_size
    data = files[start:end]

    return APIResponse(code=0, msg='查询成功', data=data, total=total)


@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def delete_api(request):
    """Delete media

    body:
      dir=img|file
      names=[...]
    """

    rel_dir = (request.data.get('dir') or 'img').strip()
    if rel_dir not in ['img', 'file']:
        rel_dir = 'img'

    force = str(request.data.get('force') or '0') == '1'

    names = request.data.get('names') or []
    if not isinstance(names, list) or len(names) == 0:
        return APIResponse(code=1, msg='names不能为空')

    # 引用检查：默认禁止删除被商品/sku引用的媒体
    refs = {}
    for name in names:
        name = str(name)
        if '/' in name or '\\' in name or '..' in name:
            continue

        used_by = []

        if rel_dir == 'img':
            # Thing.cover 支持 "#" 多图
            if Thing.objects.filter(cover__contains=name).exists():
                used_by.append('thing.cover')
            if ThingSku.objects.filter(cover=name).exists():
                used_by.append('thingSku.cover')
        else:
            # file：目前用于主视频
            if Thing.objects.filter(video=name).exists():
                used_by.append('thing.video')

        if used_by:
            refs[name] = used_by

    if refs and not force:
        return APIResponse(code=1, msg='文件被引用，禁止删除', data={'references': refs})

    base = _safe_join(MEDIA_ROOT, rel_dir)
    deleted = 0
    for name in names:
        name = str(name)
        if '/' in name or '\\' in name or '..' in name:
            continue
        if name in refs and not force:
            continue
        p = os.path.join(base, name)
        if os.path.isfile(p):
            try:
                os.remove(p)
                deleted += 1
            except Exception:
                pass

    return APIResponse(code=0, msg='删除成功', data={'deleted': deleted, 'references': refs})
