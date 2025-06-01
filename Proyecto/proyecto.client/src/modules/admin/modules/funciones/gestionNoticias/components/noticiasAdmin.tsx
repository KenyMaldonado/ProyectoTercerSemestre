import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import styles from './noticiasAdmin.module.css';


interface Noticia {
  newsId: number;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
  creationDate: string;
  createByUserID: number;
  nameUsuario: string;
}

const NoticiasAdmin = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [modoCrear, setModoCrear] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [noticiaEditando, setNoticiaEditando] = useState<Noticia | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    file: null as File | null,
    published: true
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!modoCrear) fetchNoticias();
  }, [modoCrear]);

  const fetchNoticias = async () => {
    try {
      const response = await fetch('http://localhost:5291/api/AdditionalFeaturesControllers/GetNews', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          Accept: '*/*',
        },
      });
      const data = await response.json();
      if (data.success) {
        setNoticias(data.data);
      }
    } catch (error) {
      console.error('Error al obtener noticias:', error);
    }
  };

const toggleVisibilidad = async (id: number) => {
  try {
    await fetch(`http://localhost:5291/api/AdditionalFeaturesControllers/UpdateVisible?NoticiaId=${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        Accept: '*/*',
      },
    });
    fetchNoticias();
  } catch (error) {
    console.error('Error al cambiar visibilidad:', error);
    Swal.fire('Error', 'No se pudo cambiar la visibilidad de la noticia.', 'error');
  }
};


  const eliminarNoticia = async (id: number) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la noticia permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar'
  });

  if (result.isConfirmed) {
    try {
      await fetch(`http://localhost:5291/api/AdditionalFeaturesControllers/Delete?NoticiaId=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      Swal.fire('Eliminada', 'La noticia ha sido eliminada.', 'success');
      fetchNoticias();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'No se pudo eliminar la noticia.', 'error');
    }
  }
};


const handleEditar = (noticia: Noticia) => {
  setModoEditar(true);
  setModoCrear(false); 
  setNoticiaEditando(noticia);
  setFormData({
    title: noticia.title,
    content: noticia.content,
    file: null,
    published: noticia.published
  });
  setPreviewImage(noticia.imageUrl);
};

const subirImagen = async (archivo: File): Promise<string | null> => {
  const form = new FormData();
  form.append("file", archivo);

  try {
    const res = await fetch("http://localhost:5291/api/AdditionalFeaturesControllers/UploadImage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
      body: form
    });

    const data = await res.json();
    return data?.data?.fileUrl || null;
  } catch (err) {
    console.error("Error al subir imagen:", err);
    return null;
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    form.append('file', formData.file!);
    form.append('Title', formData.title);
    form.append('Content', formData.content);
    form.append('Published', String(formData.published));
    form.append('CreationDate', new Date().toISOString());
    form.append('CreateByUserID', '1');

    try {
      const res = await fetch('http://localhost:5291/api/AdditionalFeaturesControllers/CreateNews', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: form
      });

      const result = await res.json();
      if (result.success) {
        Swal.fire('Éxito', 'Noticia creada correctamente.', 'success');
        setModoCrear(false);
        setFormData({ title: '', content: '', file: null, published: true });
        setPreviewImage(null);
      } else {
        Swal.fire('Error', 'Hubo un problema al crear la noticia.', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Error de red al crear la noticia.', 'error');
    }
  };

const handleActualizarNoticia = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!noticiaEditando) return;

  const form = new FormData();
  form.append('NewsId', String(noticiaEditando.newsId));
  form.append('Title', formData.title);
  form.append('Content', formData.content);
  form.append('Published', String(formData.published));
  form.append('CreationDate', noticiaEditando.creationDate);
  form.append('CreateByUserID', String(noticiaEditando.createByUserID));
  form.append('ImageUrl', noticiaEditando.imageUrl);

  if (formData.file) {
    form.append('file', formData.file);
  }

  try {
    const res = await fetch('http://localhost:5291/api/AdditionalFeaturesControllers/UpdateNews', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem("authToken")}`
      },
      body: form
    });

    if (res.ok) {
      Swal.fire('✅ Éxito', 'Noticia actualizada correctamente.', 'success');
      setModoEditar(false);
      setNoticiaEditando(null);
      setFormData({ title: '', content: '', file: null, published: true });
      setPreviewImage(null);
      fetchNoticias();
    } else {
      const text = await res.text();
      Swal.fire('❌ Error', text || 'Error al actualizar la noticia.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('❌ Error', 'Error de red al actualizar.', 'error');
  }
};

  return (
    <div className="noticias-admin">
      <div className="header-admin">
        <h2>🛠️ Administrador de Noticias</h2>
        <button onClick={() => setModoCrear(!modoCrear)} className="btn-toggle">
          {modoCrear ? '👁️ Ver Noticias' : '➕ Crear Noticia'}
        </button>
      </div>

      {modoCrear || modoEditar ? (
  <form onSubmit={modoEditar ? handleActualizarNoticia : handleSubmit} className="formulario-crear shadow-sm p-4 rounded bg-light">
    <h3 className="mb-4">{modoEditar ? '✏️ Editar Noticia' : '📝 Crear Nueva Noticia'}</h3>

    <div className="mb-3">
      <label className="form-label">Título</label>
      <input type="text" className="form-control" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
    </div>

    <div className="mb-3">
      <label className="form-label">Contenido</label>
      <textarea className="form-control" rows={4} required value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}></textarea>
    </div>

    <div className="mb-3">
      <label className="form-label">Imagen (opcional)</label>
      <input
        type="file"
        accept="image/*"
        className="form-control"
        onChange={e => {
          const file = e.target.files?.[0] || null;
          setFormData(prev => ({ ...prev, file }));
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />
    </div>

    {previewImage && (
      <div className="mb-3 text-center">
        <img src={previewImage} alt="Vista previa" style={{ width: '250px', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
      </div>
    )}

    <div className="form-check mb-3">
      <input type="checkbox" className="form-check-input" checked={formData.published} onChange={e => setFormData({ ...formData, published: e.target.checked })} id="publicar" />
      <label className="form-check-label" htmlFor="publicar">Publicar inmediatamente</label>
    </div>

    <div className="d-flex gap-3">
      <button type="submit" className="btn btn-primary">{modoEditar ? '💾 Actualizar' : '💾 Guardar'}</button>
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => {
          setModoCrear(false);
          setModoEditar(false);
          setNoticiaEditando(null);
          setFormData({ title: '', content: '', file: null, published: true });
          setPreviewImage(null);
        }}
      >❌ Cancelar</button>
    </div>
  </form>
) : (
  <div className={styles['cards-container']}>
    {noticias.map(noticia => (
      <div className={styles['card']} key={noticia.newsId}>
        <img src={noticia.imageUrl} alt={noticia.title} className={styles['card-img']} />
        <div className={styles['card-body']}>
          <h4>{noticia.title}</h4>
          <p>{noticia.content}</p>
          <div className={styles['card-actions']}>
            <button onClick={() => toggleVisibilidad(noticia.newsId)}>
              {noticia.published ? '👁️ Ocultar' : '🙈 Mostrar'}
            </button>
            <button onClick={() => handleEditar(noticia)}>✏️ Editar</button>
            <button onClick={() => eliminarNoticia(noticia.newsId)}>🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  );
};

export default NoticiasAdmin;