from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0043_shopsettings'),
    ]

    operations = [
        migrations.AddField(
            model_name='thing',
            name='video',
            field=models.CharField(blank=True, max_length=500, null=True),
        ),
    ]
