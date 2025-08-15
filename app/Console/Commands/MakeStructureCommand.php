<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;

class MakeStructureCommand extends Command
{
    protected $signature = 'make:structure {name} 
                            {--type=repository : Type of structure to create (repository/service)} 
                            {--force : Overwrite existing files}';
    
    protected $description = 'Generate a Repository or Service structure with contracts and implementations';

    public function handle()
    {
        $name = Str::studly($this->argument('name'));
        $type = strtolower($this->option('type'));
        
        if (!in_array($type, ['repository', 'service'])) {
            $this->error('Invalid type. Please use either "repository" or "service"');
            return 1;
        }

        $this->createStructure($name, $type);
        
        $this->info(ucfirst($type) . " structure for {$name} created successfully.");
        return 0;
    }

    protected function createStructure(string $name, string $type): void
    {
        $folder = $type === 'service' ? 'Services' : 'Repositories';
        $interfaceName = "{$name}" . ucfirst($type) . "Interface";
        $className = "{$name}" . ucfirst($type);
        $namespace = $type === 'service' ? "App\\{$folder}" : "App\\{$folder}\\{$name}";

        $basePath = $type === 'service' ? app_path("{$folder}") : app_path("{$folder}/{$name}");
        $contractPath = "{$basePath}/Contracts";
        $concretePath = "{$basePath}/Concretes";

        File::ensureDirectoryExists($contractPath);
        File::ensureDirectoryExists($concretePath);

        $interfaceFile = "{$contractPath}/{$interfaceName}.php";
        $classFile = "{$concretePath}/{$className}.php";

if (!$this->option('force')) {
            if (File::exists($interfaceFile) || File::exists($classFile)) {
                $this->error('Files already exist! Use --force to overwrite.');
                return;
            }
        }

        if ($type === 'repository') {
            $this->createRepositoryFiles($name, $namespace, $interfaceName, $className, $interfaceFile, $classFile);
        } else {
            $this->createServiceFiles($name, $namespace, $interfaceName, $className, $interfaceFile, $classFile);
        }
    }

    protected function createRepositoryFiles(
        string $name,
        string $namespace,
        string $interfaceName,
        string $className,
        string $interfaceFile,
        string $classFile
    ): void {
        $interfaceContent = <<<EOT
<?php

namespace {$namespace}\\Contracts;

use App\\Repositories\\Base\\Contracts\\QueryableRepositoryInterface;
use Illuminate\\Database\\Eloquent\\Collection;

interface {$interfaceName} extends QueryableRepositoryInterface
{
    public function get{$name}s(): Collection;
    public function getActive{$name}s(): Collection;
}
EOT;

        $classContent = <<<EOT
<?php

namespace {$namespace}\\Concretes;

use App\\Models\\{$name};
use App\\Repositories\\Base\\Concretes\\QueryableRepository;
use {$namespace}\\Contracts\\{$interfaceName};
use Illuminate\\Database\\Eloquent\\Collection;
use Spatie\\QueryBuilder\\AllowedFilter;

class {$className} extends QueryableRepository implements {$interfaceName}
{
    protected function model(): string
    {
        return {$name}::class;
    }

    public function get{$name}s(): Collection
    {
        return \$this->getFiltered();
    }

    public function getActive{$name}s(): Collection
    {
        return \$this->model->whereNotNull('email_verified_at')->get();
    }

    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
            'email',
        ];
    }

    public function getAllowedSorts(): array
    {
        return ['id', 'name'];
    }

    public function getAllowedIncludes(): array
    {
        return [];
    }

    public function getAllowedFields(): array
    {
        return ['id', 'name', 'email'];
    }
}
EOT;

        File::put($interfaceFile, $interfaceContent);
        File::put($classFile, $classContent);
    }

    protected function createServiceFiles(
        string $name,
        string $namespace,
        string $interfaceName,
        string $className,
        string $interfaceFile,
        string $classFile
    ): void {
        $interfaceContent = <<<EOT
<?php

namespace {$namespace}\\Contracts;

use App\\Services\\Base\\Contracts\\BaseServiceInterface;
use Illuminate\\Database\\Eloquent\\Collection;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Http\\Request;
use Illuminate\\Pagination\\LengthAwarePaginator;

interface {$interfaceName} extends BaseServiceInterface
{
    public function get{$name}s(): Collection;
    public function getAll{$name}s(): Collection;
    public function getFiltered{$name}s(?Request \$request = null, int \$perPage = 15): LengthAwarePaginator;
    public function get{$name}ById(int \$id): ?Model;
    public function create{$name}(array \$data): Model;
    public function update{$name}(int \$id, array \$data): Model;
    public function delete{$name}(int \$id): bool;
    public function getActive{$name}s(): Collection;
}
EOT;

        $classContent = <<<EOT
<?php

namespace {$namespace}\\Concretes;

use App\\Repositories\\{$name}\\Contracts\\{$name}RepositoryInterface;
use App\\Services\\Base\\Concretes\\BaseService;
use {$namespace}\\Contracts\\{$interfaceName};
use Illuminate\\Database\\Eloquent\\Collection;
use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Database\\Eloquent\\ModelNotFoundException;
use Illuminate\\Http\\Request;
use Illuminate\\Pagination\\LengthAwarePaginator;

class {$className} extends BaseService implements {$interfaceName}
{
    public function __construct(protected {$name}RepositoryInterface \${$name}Repository)
    {
        \$this->setRepository(\$this->{$name}Repository);
    }

    public function get{$name}s(): Collection
    {
        return \$this->repository->getFiltered();
    }

    public function getAll{$name}s(): Collection
    {
        return \$this->repository->all();
    }

    public function getFiltered{$name}s(?Request \$request = null, int \$perPage = 15): LengthAwarePaginator
    {
        return \$this->repository->paginateFiltered(\$perPage);
    }

    public function get{$name}ById(int \$id): ?Model
    {
        try {
            return \$this->repository->findOrFail(\$id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('{$name} not found');
        }
    }

    public function create{$name}(array \$data): Model
    {
        return \$this->repository->create(\$data);
    }

    public function update{$name}(int \$id, array \$data): Model
    {
        try {
            return \$this->repository->update(\$id, \$data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('{$name} not found');
        }
    }

    public function delete{$name}(int \$id): bool
    {
        try {
            \$this->repository->delete(\$id);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('{$name} not found');
        }
    }

    public function getActive{$name}s(): Collection
    {
        return \$this->repository->getActive{$name}s();
    }
}
EOT;

        File::put($interfaceFile, $interfaceContent);
        File::put($classFile, $classContent);
    }
}