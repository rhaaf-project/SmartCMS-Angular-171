import re
with open('/var/www/SmartCMS-173/api.php','r') as f:
    c = f.read()
c = c.replace("$username = 'root'", "$username = 'asterisk'")
c = c.replace("$password = ''", "$password = 'Maja1234!'")
with open('/var/www/SmartCMS-173/api.php','w') as f:
    f.write(c)
print('DB credentials updated to asterisk/Maja1234!')
