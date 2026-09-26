from copy import copy

try:
    import django.template.context

    def patch_base_context_copy(self):
        duplicate = self.__class__.__new__(self.__class__)
        for k, v in self.__dict__.items():
            if k == "dicts":
                duplicate.dicts = self.dicts[:]
            elif k == "render_context":
                duplicate.render_context = copy(v)
            else:
                setattr(duplicate, k, copy(v))
        return duplicate

    django.template.context.BaseContext.__copy__ = patch_base_context_copy
    django.template.context.Context.__copy__ = patch_base_context_copy
except Exception:
    pass
