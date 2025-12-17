from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0051_i18ntext'),
    ]

    operations = [
        migrations.AddField(
            model_name='shopsettings',
            name='paypal_client_id_enc',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='paypal_client_secret_enc',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='paypal_env',
            field=models.CharField(blank=True, default='sandbox', max_length=16),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='stripe_secret_key_enc',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='shopsettings',
            name='stripe_webhook_secret_enc',
            field=models.TextField(blank=True, null=True),
        ),
    ]
