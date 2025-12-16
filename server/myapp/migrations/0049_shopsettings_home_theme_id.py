from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0048_user_must_change_password'),
    ]

    operations = [
        migrations.AddField(
            model_name='shopsettings',
            name='home_theme_id',
            field=models.CharField(default='010', max_length=8),
        ),
    ]
