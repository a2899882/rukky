from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0049_shopsettings_home_theme_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='shopsettings',
            name='home_theme_id',
            field=models.CharField(default='001', max_length=8),
        ),
    ]
