# Project Guidelines for Claude Code

## Overview

This document provides comprehensive guidelines for working with this NestJS hexagonal architecture codebase using Claude Code. It covers project navigation, development workflows, testing strategies, and code organization principles specific to this repository.

## Project Context

**Repository**: NestJS Hexagonal Architecture Template
**Architecture**: Hexagonal (Ports & Adapters) with Domain-Driven Design
**Framework**: NestJS 11 with TypeScript 5.7.3
**Node Version**: 22.x (required)
**Main Branch**: develop

---

## Project Structure Navigation

### Root Directory Structure

```
/Users/martindeleon/Documents/HEB/nestjs-hexagonal-architecture/
├── src/                           # Source code
│   ├── domain/                   # Pure business logic (no framework deps)
│   ├── application/              # Use cases and orchestration
│   └── infrastructure/           # Framework integration and external services
├── test/                         # Comprehensive test suite
│   ├── domain/                   # Domain layer tests (no mocks)
│   ├── application/              # Application layer tests (mocked deps)
│   ├── infrastructure/           # Infrastructure tests (NestJS testing)
│   └── e2e/                      # End-to-end tests
├── .github/
│   ├── copilot-instructions.md   # AI development guidelines
│   └── instructions/             # Detailed layer-specific guides
├── .specify/                     # Spec-kit workflow tools
│   ├── memory/constitution.md    # Project constitution (v1.1.0)
│   ├── scripts/                  # Automation scripts
│   └── templates/                # Specification templates
├── .docs/                        # Technical documentation
│   ├── repository-overview.md
│   ├── technologies.md
│   ├── architecture.md
│   └── techniques-and-strategies.md
├── .claude/instructions/         # Claude-specific instructions
├── docker-compose.yml            # Local services (Postgres, Redis)
├── package.json                  # Dependencies and scripts
├── jest.config.js               # Test configuration
├── eslint.config.mjs            # Linting rules (hexagonal architecture)
└── tsconfig.json                # TypeScript configuration
```

### Layer Organization

#### Domain Layer (/src/domain/)
- **Purpose**: Pure business logic with zero external dependencies
- **Contains**:
  - `contracts/`: Interfaces (I-prefix) and DTOs
  - `entities/`: Domain entities with _entity schema pattern
  - `value-objects/`: Immutable value objects with validation
  - `errors/`: Domain-specific errors
- **Rules**:
  - No framework imports (pure TypeScript)
  - No external library imports
  - All interfaces prefixed with `I`
  - All DTOs have `DTO` suffix

#### Application Layer (/src/application/)
- **Purpose**: Orchestrate domain logic without business rules
- **Contains**:
  - `use-cases/`: Business operation orchestration
  - `config/tokens.ts`: Symbol-based dependency injection tokens
- **Rules**:
  - Maximum 3 dependencies per use case
  - No business logic (only coordination)
  - Implements IUseCase<TInput, TOutput> pattern
  - Can only import from domain layer

#### Infrastructure Layer (/src/infrastructure/)
- **Purpose**: Framework integration and external service adapters
- **Contains**:
  - `controllers/`: NestJS REST endpoints
  - `dto/`: API DTOs with validation decorators
  - `services/`: Service implementations
  - `repositories/`: Data persistence (future)
  - `orm/`: Database entities (future)
  - `app.module.ts`: Main dependency injection configuration
- **Rules**:
  - Can use NestJS decorators
  - Implements domain interfaces
  - Handles HTTP, database, external APIs
  - Converts domain errors to HTTP exceptions

---

## Development Workflow

### Starting Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run start:dev

# 3. Run tests in watch mode (separate terminal)
npm run test:watch

# 4. Check test coverage
npm run test:cov
```

### Adding a New Feature

#### 1. Specification Phase (Optional but Recommended)
```bash
# Use spec-kit to create specification from user story
speckit.specify prompt
# Follow prompts and paste user story
```

#### 2. Design Phase
- Review `.github/instructions/` for layer-specific guidelines
- Design domain interfaces first
- Plan use cases and their dependencies (max 3)
- Identify required adapters in infrastructure

#### 3. Implementation Order (TDD Approach)

**Step 1: Write Controller Test**
```typescript
// test/infrastructure/controllers/{feature}.controller.spec.ts
describe('ProductController', () => {
  let controller: ProductController;
  let mockUseCase: jest.Mocked<IGetProductsUseCase>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    mockUseCase = module.get(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE);
  });

  it('should return products', async () => {
    // Test implementation
  });
});
```

**Step 2: Define Domain Contracts**
```typescript
// src/domain/contracts/dtos/{feature}.dto.ts
export interface IProductResponseDTO {
  id: string;
  name: string;
  price: number;
}

// src/domain/contracts/{feature}-use-case.interface.ts
export interface IGetProductsUseCase {
  execute(filters: IProductFiltersDTO): Promise<IPaginationResult<IProductResponseDTO>>;
}
```

**Step 3: Write Use Case Test**
```typescript
// test/application/use-cases/{action}-{feature}.use-case.spec.ts
describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let mockRepository: jest.Mocked<IProductRepository>;

  beforeEach(() => {
    mockRepository = MockFactory.createMockProductRepository();
    useCase = new GetProductsUseCase(mockRepository);
  });

  it('should fetch products from repository', async () => {
    // Test implementation
  });
});
```

**Step 4: Implement Use Case**
```typescript
// src/application/use-cases/{action}-{feature}.use-case.ts
@Injectable()
export class GetProductsUseCase implements IGetProductsUseCase {
  constructor(
    @Inject(PRODUCT_TOKENS.PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(filters: IProductFiltersDTO): Promise<IPaginationResult<IProductResponseDTO>> {
    return await this.productRepository.findAll(filters);
  }
}
```

**Step 5: Implement Infrastructure**
```typescript
// src/infrastructure/controllers/{feature}.controller.ts
@Controller('products')
export class ProductController {
  constructor(
    @Inject(PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE)
    private readonly getProductsUseCase: IGetProductsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getProducts(@Query() filtersDto: ProductFiltersDto) {
    return await this.getProductsUseCase.execute(filtersDto);
  }
}
```

**Step 6: Configure Dependency Injection**
```typescript
// src/application/config/tokens.ts
export const PRODUCT_TOKENS = {
  PRODUCT_REPOSITORY: Symbol('IProductRepository'),
  GET_PRODUCTS_USE_CASE: Symbol('IGetProductsUseCase'),
};

// src/infrastructure/app.module.ts
@Module({
  controllers: [ProductController],
  providers: [
    {
      provide: PRODUCT_TOKENS.PRODUCT_REPOSITORY,
      useClass: PostgresProductRepository,
    },
    {
      provide: PRODUCT_TOKENS.GET_PRODUCTS_USE_CASE,
      useClass: GetProductsUseCase,
    },
  ],
})
export class AppModule {}
```

**Step 7: Write E2E Test**
```typescript
// test/e2e/{feature}.e2e-spec.ts
describe('Products API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/products (GET)', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200);
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Watch mode (recommended during development)
npm run test:watch

# Coverage report (must meet 95% lines, 90% branches)
npm run test:cov

# Unit tests only
npm run test:unit

# E2E tests only
npm run test:e2e
```

### Code Quality Checks

```bash
# Lint code (includes hexagonal architecture enforcement)
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

---

## Testing Strategy

### Coverage Requirements (Enforced)
- **Lines**: 95% minimum
- **Statements**: 95% minimum
- **Branches**: 80% minimum
- **Functions**: 90% minimum

### Testing by Layer

#### Domain Layer Tests
- **Type**: Pure unit tests
- **Mocking**: None (test actual objects)
- **Focus**: Business logic, validation, entity behavior
- **Location**: `test/domain/`

```typescript
describe('Product.create', () => {
  it('should throw error for negative price', () => {
    expect(() => Product.create('1', 'Test', -100))
      .toThrow(ValidationError);
  });
});
```

#### Application Layer Tests
- **Type**: Unit tests with mocks
- **Mocking**: Mock all dependencies (repositories, services)
- **Focus**: Orchestration, coordination
- **Location**: `test/application/`

```typescript
describe('CreateProductUseCase', () => {
  it('should call repository save method', async () => {
    await useCase.execute({ name: 'Test', price: 100 });
    expect(mockRepository.save).toHaveBeenCalled();
  });
});
```

#### Infrastructure Layer Tests
- **Type**: Integration tests
- **Mocking**: Mock use cases, not infrastructure
- **Focus**: NestJS integration, HTTP handling
- **Location**: `test/infrastructure/`

```typescript
describe('ProductController', () => {
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: TOKEN, useValue: mockUseCase }],
    }).compile();
  });
});
```

#### E2E Tests
- **Type**: Full application tests
- **Mocking**: None (real app instance)
- **Focus**: Complete user workflows
- **Location**: `test/e2e/`

### Mock Factory Pattern
Use `test/infrastructure/helpers/mock-factory.ts` for consistent mocks:

```typescript
export class MockFactory {
  static createMockProductRepository(): jest.Mocked<IProductRepository> {
    return {
      findById: jest.fn(),
      save: jest.fn(),
      // ... other methods
    };
  }
}
```

---

## Code Organization Principles

### Naming Conventions

#### File Names (kebab-case)
- Entities: `product.ts`
- Interfaces: `product-repository.interface.ts`
- Use cases: `create-product.use-case.ts`
- Controllers: `product.controller.ts`
- DTOs: `create-product.dto.ts`
- Errors: `not-found.error.ts`

#### Code Names
- Interfaces: `IProductRepository` (I-prefix)
- DTOs: `ICreateProductDTO` (I-prefix + DTO-suffix)
- Classes: `Product`, `ProductController` (PascalCase)
- Functions: `createProduct`, `getUser` (camelCase)
- Constants: `MAX_RETRIES` (UPPER_SNAKE_CASE)

### Forbidden Patterns

❌ **DO NOT**:
- Import from infrastructure into domain/application
- Use NestJS decorators in domain/application layers
- Import external libraries in domain/application (use interfaces)
- Create use cases with more than 3 dependencies
- Place business logic in use cases or infrastructure
- Expose domain entities directly (always use DTOs)
- Use magic numbers for HTTP status (use HttpStatus enum)
- Skip tests (95% coverage required)

✅ **DO**:
- Define interfaces in domain/contracts
- Implement interfaces in infrastructure
- Keep domain layer pure TypeScript
- Use Symbol-based DI tokens
- Convert domain errors to HTTP exceptions in controllers
- Write tests before implementation (TDD)
- Keep files under 300 lines

### Entity Pattern

```typescript
interface IProductSchema {
  id: string;
  name: string;
  price: number;
}

class Product {
  private constructor(private readonly _entity: IProductSchema) {}

  static create(id: string, name: string, price: number): Product {
    // Validation
    if (price < 0) throw new ValidationError('Price cannot be negative');
    return new Product({ id, name, price });
  }

  static fromSchema(schema: IProductSchema): Product {
    return new Product(schema);
  }

  // Getters
  get price(): number {
    return this._entity.price;
  }

  // Business logic
  applyDiscount(percentage: number): Product {
    const newPrice = this._entity.price * (1 - percentage / 100);
    return new Product({ ...this._entity, price: newPrice });
  }
}
```

### Error Handling

```typescript
// Domain error (in domain/errors/)
export class NotFoundError extends DomainError {
  constructor(
    public readonly resource: string,
    public readonly identifier: string,
  ) {
    super(`${resource} with identifier '${identifier}' not found`);
  }
}

// Controller error handling
@Get(':id')
async getProduct(@Param('id') id: string) {
  try {
    return await this.getProductUseCase.execute(id);
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
    throw error;
  }
}
```

---

## Working with Docker Services

### Starting Services

```bash
# Start all services (Postgres, Redis, Adminer, Redis Commander)
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Service Access
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer** (DB UI): http://localhost:8080
- **Redis Commander**: http://localhost:8081

---

## Common Tasks

### Creating a New Use Case

1. Define interface in `src/domain/contracts/{feature}-use-case.interface.ts`
2. Add token in `src/application/config/tokens.ts`
3. Create use case in `src/application/use-cases/{action}-{feature}.use-case.ts`
4. Write test in `test/application/use-cases/{action}-{feature}.use-case.spec.ts`
5. Register in `src/infrastructure/app.module.ts`

### Creating a New Controller

1. Create DTO in `src/infrastructure/dto/{dto-name}.dto.ts`
2. Create controller in `src/infrastructure/controllers/{feature}.controller.ts`
3. Write test in `test/infrastructure/controllers/{feature}.controller.spec.ts`
4. Add to app.module.ts controllers array

### Adding a New Domain Entity

1. Define schema interface
2. Create entity with _entity pattern
3. Add factory methods (create, fromSchema)
4. Add business logic methods
5. Write tests in `test/domain/entities/{entity}.spec.ts`

### Creating a Repository

1. Define interface in `src/domain/contracts/{feature}-repository.interface.ts`
2. Implement in `src/infrastructure/repositories/{feature}.repository.ts`
3. Add token in `src/application/config/tokens.ts`
4. Write test in `test/infrastructure/repositories/{feature}.repository.spec.ts`
5. Register in app.module.ts

---

## Reference Documentation

### Essential Reading
- `/Users/martindeleon/Documents/HEB/nestjs-hexagonal-architecture/.docs/architecture.md` - Complete architecture guide
- `/Users/martindeleon/Documents/HEB/nestjs-hexagonal-architecture/.docs/techniques-and-strategies.md` - Development patterns
- `/Users/martindeleon/Documents/HEB/nestjs-hexagonal-architecture/.specify/memory/constitution.md` - Project constitution (v1.1.0)

### Layer-Specific Guidelines
- `.github/instructions/hexagonal-architecture.instructions.md` - Architecture principles
- `.github/instructions/domain-layer.instructions.md` - Domain layer details
- `.github/instructions/application-layer.instructions.md` - Application layer details
- `.github/instructions/infrastructure-layer.instructions.md` - Infrastructure layer details
- `.github/instructions/testing-guidelines.instructions.md` - Testing strategy

### Quick Reference
- `.github/copilot-instructions.md` - Quick patterns reference
- `README.md` - Project overview and setup

---

## Troubleshooting

### Tests Failing
1. Check coverage requirements are met
2. Ensure mocks are properly configured
3. Verify all dependencies are mocked in use case tests
4. Check for async/await issues

### Linting Errors
1. Check for forbidden imports (infrastructure → domain/application)
2. Verify interface naming (I-prefix required)
3. Ensure hexagonal architecture rules are followed
4. Run `npm run lint` to see all errors

### Architecture Violations
1. Review ESLint hexagonal-architecture plugin errors
2. Check dependency flow (must point inward)
3. Verify no framework imports in domain/application
4. Ensure external libraries are wrapped in interfaces

---

## Tips for Success

1. **Always read existing code** before creating new patterns
2. **Follow TDD**: Write tests first, then implementation
3. **Keep use cases thin**: Maximum 3 dependencies, no business logic
4. **Domain stays pure**: Zero framework/library dependencies
5. **Test coverage matters**: 95% is enforced, not optional
6. **Use MockFactory**: Centralize test mock creation
7. **Symbol tokens**: Always use Symbol() for DI tokens
8. **Error handling**: Domain errors → HTTP exceptions in controllers
9. **Immutability**: Entities return new instances, never mutate
10. **Documentation**: Code should be self-explanatory

---

## Getting Help

- Review `.github/instructions/` for detailed layer guides
- Check `.docs/` for comprehensive technical documentation
- Consult constitution at `.specify/memory/constitution.md`
- Review existing implementations (e.g., health check feature)
- Use spec-kit workflow for complex features
