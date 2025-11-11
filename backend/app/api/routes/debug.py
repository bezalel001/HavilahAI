from datetime import datetime

from fastapi import APIRouter, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


router = APIRouter()


@router.post("/mongo", summary="Verify MongoDB connectivity")
async def mongo_healthcheck(request: Request):
    mongo_db = getattr(request.app.state, "mongo_db", None)
    if mongo_db is None:
        raise HTTPException(status_code=500, detail="Mongo client is not initialized.")

    doc = {"ping": "ok", "ts": datetime.utcnow()}
    result = await mongo_db["health"].insert_one(doc)
    stored = await mongo_db["health"].find_one({"_id": result.inserted_id})
    stored["_id"] = str(stored["_id"])
    return JSONResponse(
        {
            "inserted_id": str(result.inserted_id),
            "document": jsonable_encoder(stored),
        }
    )
