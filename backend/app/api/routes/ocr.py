from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from app.api.dependencies import get_ocr_service
from app.schemas.ocr import OcrResponse
from app.services.ocr import OcrResult, OcrService, OcrServiceError


router = APIRouter()


@router.post(
    "/extract",
    response_model=OcrResponse,
    status_code=status.HTTP_200_OK,
    summary="Extract text from an image",
)
async def extract_text(
    file: UploadFile = File(...),
    ocr_service: OcrService = Depends(get_ocr_service),
) -> OcrResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only image uploads are supported.")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded image is empty.")

    try:
        result: OcrResult = ocr_service.extract_text(data)
    except OcrServiceError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return OcrResponse(text=result.text, language=result.language)
