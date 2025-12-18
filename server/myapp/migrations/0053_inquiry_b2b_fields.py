from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0052_shopsettings_payment_secrets'),
    ]

    operations = [
        migrations.AddField(
            model_name='inquiry',
            name='country',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='inquiry',
            name='quantity',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='inquiry',
            name='preferred_contact',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
