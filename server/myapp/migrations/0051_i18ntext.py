from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0050_shopsettings_home_theme_default_001'),
    ]

    operations = [
        migrations.CreateModel(
            name='I18nText',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('model', models.CharField(max_length=50)),
                ('object_id', models.CharField(max_length=32)),
                ('field', models.CharField(max_length=50)),
                ('lang', models.CharField(max_length=16)),
                ('value', models.TextField(blank=True, null=True)),
                ('update_time', models.DateTimeField(auto_now=True, null=True)),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True)),
            ],
            options={
                'db_table': 'b_i18n_text',
            },
        ),
        migrations.AddConstraint(
            model_name='i18ntext',
            constraint=models.UniqueConstraint(fields=('model', 'object_id', 'field', 'lang'), name='uniq_i18n_text_key'),
        ),
        migrations.AddIndex(
            model_name='i18ntext',
            index=models.Index(fields=['model', 'object_id'], name='idx_i18n_obj'),
        ),
        migrations.AddIndex(
            model_name='i18ntext',
            index=models.Index(fields=['lang'], name='idx_i18n_lang'),
        ),
    ]
