from django.contrib.auth.hashers import Argon2PasswordHasher

class ParanoidArgon2Hasher(Argon2PasswordHasher):
    """
    Hyper-advanced Argon2 hasher tuning.
    Increases memory cost and iterations to mathematically crush 
    hardware-accelerated (ASIC/GPU) brute-force hashing farms.
    """
    time_cost = 4        # Double default iterations (from 2)
    memory_cost = 204800 # 200 MB per hash (from 100MB)
    parallelism = 8      # High thread concurrency
