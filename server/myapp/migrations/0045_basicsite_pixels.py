from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0044_thing_video'),
    ]

    operations = [
        migrations.AddField(
            model_name='basicsite',
            name='ga4_enable',
            field=models.CharField(default='2', max_length=2),
        ),
        migrations.AddField(
            model_name='basicsite',
            name='ga4_measurement_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='basicsite',
            name='meta_pixel_enable',
            field=models.CharField(default='2', max_length=2),
        ),
        migrations.AddField(
            model_name='basicsite',
            name='meta_pixel_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='basicsite',
            name='tiktok_pixel_enable',
            field=models.CharField(default='2', max_length=2),
        ),
        migrations.AddField(
            model_name='basicsite',
            name='tiktok_pixel_id',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
