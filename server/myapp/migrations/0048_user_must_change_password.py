from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0047_merge_0010_shop_order_payment_0046_shop_variants_inventory'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='must_change_password',
            field=models.CharField(default='0', max_length=1),
        ),
    ]
