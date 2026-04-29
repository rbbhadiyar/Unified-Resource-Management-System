from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.deps.auth import get_current_user, require_admin
from app.db.database import get_db
from app.models import Resource, ResourceType, User
from app.schemas.resources import ResourceCreate, ResourceOut, ResourceUpdate

router = APIRouter(prefix="/resources", tags=["resources"])


def _to_out(db: Session, r: Resource) -> ResourceOut:
    tn = None
    if r.resource_type:
        tn = r.resource_type.type_name
    return ResourceOut(
        resource_id=r.resource_id,
        resource_name=r.resource_name,
        description=r.description,
        type_id=r.type_id,
        type_name=tn,
        total_quantity=r.total_quantity,
        available_quantity=r.available_quantity,
        lease_per_day=r.lease_per_day,
        security_deposit=r.security_deposit,
        is_leasable=r.is_leasable,
        fine_per_day=r.fine_per_day,
        attributes_json=r.attributes_json,
    )


@router.get("/", response_model=list[ResourceOut])
def list_resources(
    db: Session = Depends(get_db),
    type_id: int | None = Query(None),
    q: str | None = Query(None, description="Search name"),
    current: User = Depends(get_current_user),
):
    del current
    query = db.query(Resource)
    if type_id is not None:
        query = query.filter(Resource.type_id == type_id)
    if q:
        like = f"%{q}%"
        query = query.filter(Resource.resource_name.ilike(like))
    rows = query.all()
    return [_to_out(db, r) for r in rows]


@router.post("/", response_model=ResourceOut)
def create_resource(
    body: ResourceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    if not db.query(ResourceType).filter(ResourceType.type_id == body.type_id).first():
        raise HTTPException(status_code=400, detail="Invalid type_id")
    r = Resource(
        resource_name=body.resource_name,
        description=body.description,
        type_id=body.type_id,
        total_quantity=body.total_quantity,
        available_quantity=body.total_quantity,
        lease_per_day=body.lease_per_day,
        security_deposit=body.security_deposit or 0.0,
        is_leasable=body.is_leasable,
        fine_per_day=body.fine_per_day,
        attributes_json=body.attributes_json,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return _to_out(db, r)


@router.put("/{resource_id}", response_model=ResourceOut)
def update_resource(
    resource_id: int,
    body: ResourceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    r = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    data = body.model_dump(exclude_unset=True)
    if "type_id" in data and data["type_id"] is not None:
        if not db.query(ResourceType).filter(ResourceType.type_id == data["type_id"]).first():
            raise HTTPException(status_code=400, detail="Invalid type_id")
    if "total_quantity" in data and data["total_quantity"] is not None:
        diff = data["total_quantity"] - r.total_quantity
        r.available_quantity = max(0, r.available_quantity + diff)
    for k, v in data.items():
        setattr(r, k, v)
    db.commit()
    db.refresh(r)
    return _to_out(db, r)


@router.delete("/{resource_id}")
def delete_resource(
    resource_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    r = db.query(Resource).filter(Resource.resource_id == resource_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Resource not found")
    db.delete(r)
    db.commit()
    return {"detail": "deleted"}


@router.get("/types", response_model=list[dict])
def resource_types(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    rows = db.query(ResourceType).all()
    return [{"type_id": t.type_id, "type_name": t.type_name, "description": t.description} for t in rows]
