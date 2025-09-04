"""Main FastAPI application for EAMP reference server."""

import logging
import sys
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app import __version__
from app.config import settings
from app.database import db
from app.middleware.auth import AuthMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.routes.health import router as health_router
from app.routes.info import router as info_router
from app.routes.metadata import router as metadata_router
from app.routes.metrics import router as metrics_router
from app.utils.logging_config import setup_logging
from app.utils.sample_data import initialize_sample_data

# Set up logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan manager."""
    logger.info("🚀 Starting EAMP FastAPI Server...")
    
    # Initialize database
    logger.info("Initializing database...")
    await db.initialize()
    
    # Load sample data in development
    if settings.environment == "development":
        logger.info("Loading sample data...")
        await initialize_sample_data(db)
    
    logger.info("✅ Server startup complete")
    
    yield
    
    # Cleanup
    logger.info("🛑 Shutting down EAMP FastAPI Server...")
    await db.close()
    logger.info("✅ Server shutdown complete")


# Create FastAPI app
app = FastAPI(
    title="EAMP Reference Server",
    description="FastAPI reference implementation for EAMP (Extended Accessibility Metadata Protocol)",
    version=__version__,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors.allowed_origins,
    allow_credentials=True,
    allow_methods=settings.cors.allowed_methods,
    allow_headers=settings.cors.allowed_headers,
    expose_headers=["X-Total-Count", "ETag", "Cache-Control"],
)

# Add compression middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Add authentication middleware
if settings.security.valid_api_keys:
    app.add_middleware(AuthMiddleware)

# Add rate limiting middleware
app.add_middleware(RateLimitMiddleware)

# Include routers
app.include_router(health_router, tags=["Health"])
app.include_router(info_router, tags=["Info"])
app.include_router(metadata_router, prefix="/metadata", tags=["Metadata"])

# Include metrics router if enabled
if settings.monitoring.enable_metrics:
    app.include_router(
        metrics_router, 
        prefix=settings.monitoring.metrics_endpoint, 
        tags=["Metrics"]
    )


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    """Handle uncaught exceptions."""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    if settings.debug:
        # In debug mode, show the actual error
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "SERVER_ERROR",
                    "message": str(exc),
                    "type": type(exc).__name__,
                }
            },
        )
    else:
        # In production, return generic error
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "SERVER_ERROR",
                    "message": "Internal server error",
                }
            },
        )


def main() -> None:
    """Run the server."""
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload and settings.environment == "development",
        workers=1 if settings.reload else settings.workers,
        log_level=settings.log_level.lower(),
        access_log=True,
    )


if __name__ == "__main__":
    main()