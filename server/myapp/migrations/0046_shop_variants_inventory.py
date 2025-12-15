from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0045_basicsite_pixels'),
    ]

    operations = [
        migrations.AddField(
            model_name='thing',
            name='track_stock',
            field=models.CharField(default='2', max_length=2),
        ),
        migrations.AddField(
            model_name='thing',
            name='stock',
            field=models.IntegerField(default=0),
        ),
        migrations.CreateModel(
            name='ThingSku',
            fields=[
                ('id', models.BigAutoField(primary_key=True, serialize=False)),
                ('sku_code', models.CharField(blank=True, max_length=100, null=True)),
                ('attrs', models.JSONField(blank=True, null=True)),
                ('price', models.CharField(blank=True, max_length=100, null=True)),
                ('stock', models.IntegerField(default=0)),
                ('cover', models.CharField(blank=True, max_length=500, null=True)),
                ('status', models.CharField(default='0', max_length=1)),
                ('create_time', models.DateTimeField(auto_now_add=True, null=True)),
                ('update_time', models.DateTimeField(auto_now=True, null=True)),
                ('thing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='skus', to='myapp.thing')),
            ],
            options={
                'db_table': 'b_thing_sku',
            },
        ),
        migrations.AddField(
            model_name='order',
            name='inventory_deducted',
            field=models.CharField(default='2', max_length=2),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='sku',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='myapp.thingsku'),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='sku_snapshot',
            field=models.CharField(blank=True, max_length=300, null=True),
        ),
    ]
