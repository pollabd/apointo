# Backend Setup Script for Windows

Write-Host "🚀 Setting up NestJS Backend..." -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please update it with your configuration." -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Update the following in .env:" -ForegroundColor Yellow
    Write-Host "   - DATABASE_URL (if using different PostgreSQL credentials)" -ForegroundColor Yellow
    Write-Host "   - JWT_SECRET (change to a secure random string)" -ForegroundColor Yellow
    Write-Host "   - STRIPE_SECRET_KEY (add your Stripe key if using payments)" -ForegroundColor Yellow
    Write-Host "   - CLOUDINARY credentials (optional, will use local storage if not set)" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Prisma generate failed" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📊 Database Setup" -ForegroundColor Cyan
Write-Host "Please ensure PostgreSQL is running before proceeding." -ForegroundColor Yellow
Write-Host ""
Write-Host "Options:" -ForegroundColor White
Write-Host "  1. Use Docker: docker-compose up -d postgres" -ForegroundColor White
Write-Host "  2. Use local PostgreSQL on port 5432" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Continue with database migration? (y/n)"

if ($continue -eq "y" -or $continue -eq "Y") {
    Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
    npx prisma migrate dev --name init
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
        npx prisma db seed
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Backend setup complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📝 Default login credentials:" -ForegroundColor Cyan
            Write-Host "   Admin:   admin@apointo.com / password123" -ForegroundColor White
            Write-Host "   Doctor:  richard.james@apointo.com / password123" -ForegroundColor White
            Write-Host "   Patient: patient@test.com / password123" -ForegroundColor White
            Write-Host ""
            Write-Host "🚀 To start the development server, run:" -ForegroundColor Cyan
            Write-Host "   npm run start:dev" -ForegroundColor White
            Write-Host ""
        } else {
            Write-Host "⚠️  Database seeding failed (this is okay if already seeded)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Database migration failed" -ForegroundColor Red
        Write-Host "Make sure PostgreSQL is running and credentials in .env are correct" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host ""
    Write-Host "⏭️  Skipping database setup" -ForegroundColor Yellow
    Write-Host "Run these commands manually when PostgreSQL is ready:" -ForegroundColor White
    Write-Host "  npx prisma migrate dev --name init" -ForegroundColor White
    Write-Host "  npx prisma db seed" -ForegroundColor White
    Write-Host "  npm run start:dev" -ForegroundColor White
}
