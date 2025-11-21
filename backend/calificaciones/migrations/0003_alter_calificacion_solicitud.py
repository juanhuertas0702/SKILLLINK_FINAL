# Generated migration to preserve ratings when deleting chats

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calificaciones', '0002_initial'),
        ('solicitudes', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='calificacion',
            name='solicitud',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name='calificacion',
                to='solicitudes.solicitud'
            ),
        ),
    ]
