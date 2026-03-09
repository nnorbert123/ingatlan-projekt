import React, { useState, useRef } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Cropper from 'react-easy-crop';
import { Modal } from 'react-bootstrap';

// Sortable kép elem komponens
function SortableImageItem({ id, image, onRemove, onSetPrimary, onCrop, isPrimary }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="image-item position-relative"
    >
      <div className={`image-wrapper ${isPrimary ? 'primary-image' : ''}`}>
        <button
          type="button"
          className="img-delete-corner-btn"
          onClick={() => onRemove(id)}
          title="Törlés"
        >
          ✕
        </button>
        <img
          src={typeof image === 'string' ? image : URL.createObjectURL(image)}
          alt="Ingatlan"
          className="img-fluid rounded"
        />
        
        {/* Drag handle */}
        <div
          {...attributes}
          {...listeners}
          className="drag-handle"
          title="Húzd ide a rendezéshez"
        >
          <i className="fas fa-grip-vertical"></i>
        </div>

        {/* Elsődleges badge */}
        {isPrimary && (
          <span className="badge bg-primary position-absolute top-0 start-0 m-2">
            <i className="fas fa-star me-1"></i>
            Főkép
          </span>
        )}

        {/* Műveletek */}
        <div className="image-actions">
          {!isPrimary && (
            <button
              type="button"
              className="btn btn-sm btn-light me-1"
              onClick={() => onSetPrimary(id)}
              title="Beállítás főképként"
            >
              <i className="fas fa-star"></i>
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-light me-1"
            onClick={() => onCrop(id, image)}
            title="Vágás"
          >
            <i className="fas fa-crop"></i>
          </button>
          <button
            type="button"
  	    className="img-remove-btn"
  	    onClick={() => onRemove(id)}
  	    title="Törlés"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

// Crop modal komponens
function ImageCropModal({ show, onHide, image, onCropComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [rotation, setRotation] = useState(0);

  const onCropAreaComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels || !image) return;
    
    try {
      const croppedImage = await getCroppedImg(
        typeof image === 'string' ? image : URL.createObjectURL(image),
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedImage);
      onHide();
    } catch (error) {
      console.error('Crop hiba:', error);
      alert('Hiba történt a kép vágása során.');
    }
  };

  // Ha nincs kép, ne rendereljük a modal-t
  if (!image) {
    return null;
  }

  const imageUrl = typeof image === 'string' ? image : URL.createObjectURL(image);

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-crop me-2"></i>
          Kép vágása
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ position: 'relative', width: '100%', height: '400px' }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={16 / 9}
            onCropChange={setCrop}
            onCropComplete={onCropAreaComplete}
            onZoomChange={setZoom}
          />
        </div>
        
        <div className="mt-3">
          <label className="form-label">
            <i className="fas fa-search-plus me-2"></i>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            className="form-range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>

        <div className="mt-3">
          <label className="form-label">
            <i className="fas fa-redo me-2"></i>
            Forgatás: {rotation}°
          </label>
          <input
            type="range"
            className="form-range"
            min={0}
            max={360}
            step={1}
            value={rotation}
            onChange={(e) => setRotation(parseInt(e.target.value))}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onHide}>
          <i className="fas fa-times me-2"></i>
          Mégse
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          <i className="fas fa-check me-2"></i>
          Mentés
        </button>
      </Modal.Footer>
    </Modal>
  );
}

// Crop segédfüggvény
async function getCroppedImg(imageSrc, pixelCrop, rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  canvas.width = safeArea;
  canvas.height = safeArea;

  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.putImageData(
    data,
    0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x,
    0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
}

function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

// Fő képkezelő komponens
function AdvancedImageUploader({ images = [], onChange, maxImages = 10 }) {
  const [items, setItems] = useState(images);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImage, setCropImage] = useState(null);
  const [cropImageId, setCropImageId] = useState(null);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Képek változásának továbbítása
  React.useEffect(() => {
    if (onChange) {
      onChange(items);
    }
  }, [items, onChange]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (files) => {
    if (items.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} képet tölthetsz fel!`);
      return;
    }

    const newItems = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      isPrimary: items.length === 0 && index === 0
    }));

    setItems([...items, ...newItems]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    addFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleRemove = (id) => {
    const newItems = items.filter(item => item.id !== id);
    
    // Ha töröljük az elsődleges képet, az első legyen az új elsődleges
    if (items.find(item => item.id === id)?.isPrimary && newItems.length > 0) {
      newItems[0].isPrimary = true;
    }
    
    setItems(newItems);
    if (fileInputRef.current) { fileInputRef.current.value = ''; }
  };
    // File input reset - hogy ugyanazt a képet újra fel lehessen tölteni
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

  const handleSetPrimary = (id) => {
    setItems(items.map(item => ({
      ...item,
      isPrimary: item.id === id
    })));
  };

  const handleCrop = (id, image) => {
    setCropImageId(id);
    setCropImage(image);
    setShowCropModal(true);
  };

  const handleCropComplete = (croppedBlob) => {
    setItems(items.map(item => {
      if (item.id === cropImageId) {
        return {
          ...item,
          file: new File([croppedBlob], `cropped-${item.id}.jpg`, { type: 'image/jpeg' })
        };
      }
      return item;
    }));
    setCropImage(null);
    setCropImageId(null);
  };

  return (
    <div className="advanced-image-uploader">
      {/* Upload terület */}
      <div
        className={`upload-area ${isDraggingOver ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          multiple
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <i className="fas fa-cloud-upload-alt fa-3x mb-3 text-primary"></i>
          <h5>Húzd ide a képeket vagy kattints a böngészéshez</h5>
          <p className="text-muted">
            Maximum {maxImages} kép • PNG, JPG, JPEG
            <br />
            {items.length > 0 && `${items.length} / ${maxImages} kép feltöltve`}
          </p>
        </div>
      </div>

      {/* Képek listája */}
      {items.length > 0 && (
        <div className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>
              <i className="fas fa-images me-2"></i>
              Feltöltött képek ({items.length})
            </h6>
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Húzd a képeket a rendezéshez
            </small>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
              <div className="images-grid">
                {items.map((item) => (
                  <SortableImageItem
                    key={item.id}
                    id={item.id}
                    image={item.file}
                    onRemove={handleRemove}
                    onSetPrimary={handleSetPrimary}
                    onCrop={handleCrop}
                    isPrimary={item.isPrimary}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Crop modal */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        image={cropImage}
        onCropComplete={handleCropComplete}
      />

      <style jsx>{`
        .upload-area {
          border: 3px dashed #dee2e6;
          border-radius: 12px;
          padding: 3rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #f8f9fa;
        }

        .upload-area:hover {
          border-color: #007bff;
          background: #e7f1ff;
        }

        .upload-area.dragging {
          border-color: #28a745;
          background: #d4edda;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .image-item {
          cursor: grab;
        }

        .image-item:active {
          cursor: grabbing;
        }

        .image-wrapper {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .image-wrapper.primary-image {
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }

        .image-wrapper:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .image-wrapper img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .drag-handle {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          cursor: grab;
          z-index: 10;
        }

        .image-wrapper:hover .drag-handle {
          opacity: 1;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .image-actions {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.5rem;
          background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
          display: flex;
          justify-content: center;
          gap: 0.25rem;
          opacity: 1;
        }
      
        .img-delete-corner-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          left: auto;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          padding: 0;
        }

        .img-delete-corner-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: rotate(90deg);
        }
`}</style>
    </div>
  );
}

export default AdvancedImageUploader;
