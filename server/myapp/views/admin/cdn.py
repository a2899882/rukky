import os
from pathlib import Path

from django.core.files.storage import default_storage
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes

from myapp import utils
from myapp.auth.authentication import AdminTokenAuthtication
from myapp.handler import APIResponse
from myapp.permission.permission import check_if_demo, isDemoAdminUser
from server.settings import MEDIA_ROOT, BASE_HOST_URL, CDN_IMAGE_UPLOAD_SIZE, CDN_VIDEO_UPLOAD_SIZE, \
    CDN_FILE_UPLOAD_SIZE


# 用于上传Logo图片
@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def upload_logo_img(request):
    if request.method == 'POST':
        # 确保存在文件
        myfile = request.FILES.get('my-file')
        if not myfile:
            return JsonResponse({"code": 1, "message": "No file uploaded."}, status=400)

        # 打印文件大小
        file_size = myfile.size
        print('Uploaded file size:', file_size)

        # 文件类型和大小验证
        max_size = CDN_IMAGE_UPLOAD_SIZE
        valid_extensions = ['.png']  # 允许的文件扩展名

        if file_size > max_size:
            return JsonResponse({"code": 1, "message": "图片太大，需小于5MB"})

        file_extension = Path(myfile.name).suffix
        if file_extension not in valid_extensions:
            return JsonResponse({"code": 1, "message": "非法文件格式"})

        # 生成新文件名
        new_name = "logo.png"

        # 拼接保存路径
        save_path = os.path.join(MEDIA_ROOT, 'img', new_name)
        print('save_path------------', save_path)

        # 保存文件
        try:
            # 使用 Django 的默认存储来保存文件
            relative_path = os.path.join('img', new_name)
            # 如果目标文件已存在，先删除
            if default_storage.exists(relative_path):
                default_storage.delete(relative_path)
            # 执行保存
            full_path = default_storage.save(relative_path, myfile)
            print('File saved at:', full_path)

            resp_json = {
                "code": 0,
                "data": new_name
            }
            return JsonResponse(resp_json)

        except Exception as e:
            print('Error saving file:', e)
            return JsonResponse({"code": 1, "message": "Error saving file."})

    return JsonResponse({"code": 1, "message": "Invalid request method."})


# 用于上传Ico图片
@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def upload_ico_img(request):
    if request.method == 'POST':
        # 确保存在文件
        myfile = request.FILES.get('my-file')
        if not myfile:
            return JsonResponse({"code": 1, "message": "No file uploaded."}, status=400)

        # 打印文件大小
        file_size = myfile.size
        print('Uploaded file size:', file_size)

        # 文件类型和大小验证
        max_size = CDN_IMAGE_UPLOAD_SIZE
        valid_extensions = ['.ico']  # 允许的文件扩展名

        if file_size > max_size:
            return JsonResponse({"code": 1, "message": "图片太大，需小于5MB"})

        file_extension = Path(myfile.name).suffix
        if file_extension not in valid_extensions:
            return JsonResponse({"code": 1, "message": "非法文件格式"})

        # 生成新文件名
        new_name = "favicon.ico"

        # 拼接保存路径
        save_path = os.path.join(MEDIA_ROOT, 'img', new_name)
        print('save_path------------', save_path)

        # 保存文件
        try:
            # 使用 Django 的默认存储来保存文件
            relative_path = os.path.join('img', new_name)
            # 如果目标文件已存在，先删除
            if default_storage.exists(relative_path):
                default_storage.delete(relative_path)
            # 执行保存
            full_path = default_storage.save(relative_path, myfile)
            print('File saved at:', full_path)

            resp_json = {
                "code": 0,
                "data": new_name
            }
            return JsonResponse(resp_json)

        except Exception as e:
            print('Error saving file:', e)
            return JsonResponse({"code": 1, "message": "Error saving file."})

    return JsonResponse({"code": 1, "message": "Invalid request method."})


# 用于普通上传图片
@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def upload_img(request):
    if request.method == 'POST':
        # 确保存在文件
        myfile = request.FILES.get('my-file')
        if not myfile:
            return JsonResponse({"code": 1, "message": "No file uploaded."}, status=400)

        # 打印文件大小
        file_size = myfile.size
        print('Uploaded file size:', file_size)

        # 文件类型和大小验证
        max_size = CDN_IMAGE_UPLOAD_SIZE
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.ico']  # 允许的文件扩展名

        if file_size > max_size:
            return JsonResponse({"code": 1, "message": "图片太大，需小于5MB"})

        file_extension = Path(myfile.name).suffix
        if file_extension not in valid_extensions:
            return JsonResponse({"code": 1, "message": "非法文件格式"})

        # 生成新文件名
        new_name = f"{utils.get_timestamp()}{file_extension}"

        # 拼接保存路径
        save_path = os.path.join(MEDIA_ROOT, 'img', new_name)
        print('save_path------------', save_path)

        # 保存文件
        try:
            # 使用 Django 的默认存储来保存文件
            full_path = default_storage.save(os.path.join('img', new_name), myfile)
            print('File saved at:', full_path)

            resp_json = {
                "code": 0,
                "data": new_name
            }
            return JsonResponse(resp_json)

        except Exception as e:
            print('Error saving file:', e)
            return JsonResponse({"code": 1, "message": "Error saving file."})

    return JsonResponse({"code": 1, "message": "Invalid request method."})


# 用于普通上传文件（下载管理）
@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
@check_if_demo
def upload_normal_file(request):
    if request.method == 'POST':
        # 确保存在文件
        myfile = request.FILES.get('my-file')
        if not myfile:
            return JsonResponse({"code": 1, "message": "No file uploaded."}, status=400)

        # 打印文件大小
        file_size = myfile.size
        print('Uploaded file size:', file_size)

        # 文件类型和大小验证
        max_size = CDN_FILE_UPLOAD_SIZE
        valid_extensions = ['.jpg', '.jpeg', '.png', '.docx', '.pdf', '.zip', '.rar']  # 允许的文件扩展名

        if file_size > max_size:
            return JsonResponse({"code": 1, "message": "图片太大，需小于500MB"})

        file_extension = Path(myfile.name).suffix
        if file_extension not in valid_extensions:
            return JsonResponse({"code": 1, "message": "非法文件格式"})

        # 生成新文件名
        new_name = f"{utils.get_timestamp()}{file_extension}"

        # 拼接保存路径
        save_path = os.path.join(MEDIA_ROOT, 'file', new_name)
        print('save_path------------', save_path)

        # 保存文件
        try:
            # 使用 Django 的默认存储来保存文件
            full_path = default_storage.save(os.path.join('file', new_name), myfile)
            print('File saved at:', full_path)

            resp_json = {
                "code": 0,
                "data": new_name
            }
            return JsonResponse(resp_json)

        except Exception as e:
            print('Error saving file:', e)
            return JsonResponse({"code": 1, "message": "Error saving file."})

    return JsonResponse({"code": 1, "message": "Invalid request method."})


# 用于富文本上传文件
@api_view(['POST'])
@authentication_classes([AdminTokenAuthtication])
def upload_file(request):
    if request.method == 'POST':

        # 特殊情况 (需返回特殊json)
        if isDemoAdminUser(request):
            return JsonResponse({"errno": 1, "message": "演示账号无法操作"})

        # 确保存在文件
        myfile = request.FILES.get('my-file')
        if not myfile:
            return JsonResponse({"errno": 1, "message": "No file uploaded."}, status=400)

        # 打印文件大小
        file_size = myfile.size
        print('Uploaded file size:', file_size)

        file_extension = Path(myfile.name).suffix

        # 定义文件类型和大小限制
        video_extensions = ['.mp4']
        image_extensions = ['.jpeg', '.jpg', '.png']

        if file_extension in image_extensions:
            max_size = CDN_IMAGE_UPLOAD_SIZE
            if file_size > max_size:
                return JsonResponse({"errno": 1, "message": "图片太大"})

        elif file_extension in video_extensions:
            max_size = CDN_VIDEO_UPLOAD_SIZE
            if file_size > max_size:
                return JsonResponse({"errno": 1, "message": "视频太大"})

        if file_extension not in image_extensions and file_extension not in video_extensions:
            return JsonResponse({"errno": 1, "message": "非法文件格式"})

        # 生成新文件名
        new_name = f"{utils.get_timestamp()}{file_extension}"

        # 拼接保存路径
        save_path = os.path.join(MEDIA_ROOT, 'file', new_name)
        print('save_path------------', save_path)

        # 保存文件
        try:
            # 使用 Django 的默认存储来保存文件
            full_path = default_storage.save(os.path.join('file', new_name), myfile)
            print('File saved at:', full_path)

            resp_json = {
                "errno": 0,
                "data": {
                    "url": BASE_HOST_URL + '/upload/file/' + new_name,
                }
            }
            return JsonResponse(resp_json)

        except Exception as e:
            print('Error saving file:', e)
            return JsonResponse({"errno": 1, "message": "Error saving file."})

    return JsonResponse({"errno": 1, "message": "Invalid request method."})
