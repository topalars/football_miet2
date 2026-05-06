from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("main", "0002_comment"),
    ]

    operations = [
        migrations.DeleteModel(name="Comment"),
    ]
