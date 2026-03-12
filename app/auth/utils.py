import random
import string

def generar_codigo_licencia(user_id: int) -> str: # Mantenerlo así obliga a que el router valide primero
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"AKA-INSUR-{user_id}-{random_str}"