<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            InitialProjectSeeder::class,
            RolesSeeder::class,
            CategorySeeder::class,
            // PermissionSeeder::class, // Now handled by InitialProjectSeeder
            //LocationSeeder::class,
        ]);
    }
}
