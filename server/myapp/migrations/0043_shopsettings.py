from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0042_alter_basicadditional_ext02'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShopSettings',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('enable_stripe', models.CharField(choices=[('1', '开启'), ('2', '关闭')], default='1', max_length=2)),
                ('enable_paypal', models.CharField(choices=[('1', '开启'), ('2', '关闭')], default='1', max_length=2)),
                ('default_currency', models.CharField(default='USD', max_length=3)),
                ('default_shipping_fee', models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('update_time', models.DateTimeField(auto_now=True, null=True)),
            ],
            options={
                'db_table': 'b_shop_settings',
            },
        ),
    ]
