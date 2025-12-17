from __future__ import annotations

from typing import Dict, Iterable, List, Optional, Sequence, Tuple

from myapp.models import I18nText


def get_lang_from_request(request) -> str:
    try:
        v = (request.COOKIES.get('lang') or '').strip()
        return v or 'en'
    except Exception:
        return 'en'


def _load_map(lang: str, keys: Sequence[Tuple[str, str, str]]) -> Dict[Tuple[str, str, str], str]:
    if not keys:
        return {}

    models = sorted({k[0] for k in keys})
    obj_ids = sorted({k[1] for k in keys})
    fields = sorted({k[2] for k in keys})

    qs = I18nText.objects.filter(lang=lang, model__in=models, object_id__in=obj_ids, field__in=fields)

    m: Dict[Tuple[str, str, str], str] = {}
    for t in qs:
        if t.value is None:
            continue
        m[(t.model, t.object_id, t.field)] = t.value
    return m


def apply_translations_for_list(lang: str, model: str, items: List[dict], fields: Sequence[str], id_key: str = 'id') -> None:
    if not lang or lang == 'en' or not items:
        return

    keys: List[Tuple[str, str, str]] = []
    for it in items:
        obj_id = str(it.get(id_key) or '')
        if not obj_id:
            continue
        for f in fields:
            keys.append((model, obj_id, f))

    mapping = _load_map(lang, keys)
    for it in items:
        obj_id = str(it.get(id_key) or '')
        if not obj_id:
            continue
        for f in fields:
            v = mapping.get((model, obj_id, f))
            if v is not None and v != '':
                it[f] = v


def apply_translations_for_obj(lang: str, model: str, obj: dict, fields: Sequence[str], object_id: Optional[str] = None) -> None:
    if not obj or not lang or lang == 'en':
        return

    obj_id = object_id or str(obj.get('id') or '')
    if not obj_id:
        return

    keys: List[Tuple[str, str, str]] = [(model, obj_id, f) for f in fields]
    mapping = _load_map(lang, keys)
    for f in fields:
        v = mapping.get((model, obj_id, f))
        if v is not None and v != '':
            obj[f] = v
