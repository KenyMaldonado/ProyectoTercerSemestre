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
    published: true,
    createByUserID: 1,  // default, actualizar según usuario real
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Aquí podrías cargar el usuario logueado y actualizar createByUserID si es necesario
  // Ejemplo:
  // useEffect(() => {
  //   const userID = obtenerUsuarioLogueadoID();
  //   setFormData(prev => ({ ...prev, createByUserID: userID }));
  // }, []);

  useEffect(() => {
    if (!modoCrear && !modoEditar) fetchNoticias();
  }, [modoCrear, modoEditar]);

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
      published: noticia.published,
      createByUserID: noticia.createByUserID
    });
    setPreviewImage(noticia.imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = new FormData();
    if (formData.file) {
      form.append('file', formData.file);
    }
    form.append('Title', formData.title);
    form.append('Content', formData.content);
    form.append('Published', String(formData.published));
    form.append('CreationDate', new Date().toISOString());
    form.append('CreateByUserID', String(formData.createByUserID));

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
        setFormData({ title: '', content: '', file: null, published: true, createByUserID: formData.createByUserID });
        setPreviewImage(null);
        fetchNoticias();
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
    form.append('CreateByUserID', String(formData.createByUserID));

    if (formData.file) {
      form.append('file', formData.file);
    } else {
      form.append('ImageUrl', noticiaEditando.imageUrl);
    }

    try {
      const response = await fetch('http://localhost:5291/api/AdditionalFeaturesControllers/UpdateNews', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`
        },
        body: form
      });

      if (!response.ok) {
        try {
          const errorJson = await response.json();
          throw new Error(errorJson.message || 'Fallo inesperado');
        } catch {
          throw new Error('El archivo supera el límite de 5 MB.');
        }
      }

      Swal.fire('✅ Éxito', 'Noticia actualizada correctamente.', 'success');
      setModoEditar(false);
      setNoticiaEditando(null);
      setFormData({ title: '', content: '', file: null, published: true, createByUserID: formData.createByUserID });
      setPreviewImage(null);
      fetchNoticias();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Error actualizando noticia:', err);
      Swal.fire('❌ Error', err.message || 'Error de red al actualizar.', 'error');
    }
  };

  return (
    <div className="noticias-admin">
      <div className="header-admin">
        <h2>🛠️ Administrador de Noticias</h2>
        <button onClick={() => {
          setModoCrear(!modoCrear);
          setModoEditar(false);
          setNoticiaEditando(null);
          setFormData({ title: '', content: '', file: null, published: true, createByUserID: formData.createByUserID });
          setPreviewImage(null);
        }} className="btn-toggle">
          {modoCrear ? '👁️ Ver Noticias' : '➕ Crear Noticia'}
        </button>
      </div>

      {(modoCrear || modoEditar) ? (
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
            <input type="file" accept="image/*" className="form-control" onChange={e => {
              const file = e.target.files?.[0] || null;
              setFormData(prev => ({ ...prev, file }));
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviewImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
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
            <button type="button" className="btn btn-secondary" onClick={() => {
              setModoCrear(false);
              setModoEditar(false);
              setNoticiaEditando(null);
              setFormData({ title: '', content: '', file: null, published: true, createByUserID: formData.createByUserID });
              setPreviewImage(null);
            }}>❌ Cancelar</button>
          </div>
        </form>
      ) : (
        <div className={styles['cards-container']}>
          {noticias.map(noticia => (
            <div className={styles['card']} key={noticia.newsId}>
              <img src={`${noticia.imageUrl}?v=${new Date(noticia.creationDate).getTime()}`} alt={noticia.title} className={styles['card-img']} />
              <div className={styles['card-body']}>
                <h5 className={styles['card-title']}>{noticia.title}</h5>
                <p className={styles['card-text']}>{noticia.content}</p>
                <p style={{ fontStyle: 'italic', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  📅 {new Date(noticia.creationDate).toLocaleDateString()} — 👤 {noticia.nameUsuario || 'Desconocido'}
                </p>
                <div className={styles['card-actions']}>
                  <button onClick={() => toggleVisibilidad(noticia.newsId)} className="btn btn-sm btn-warning">
                    {noticia.published ? '👁️ Ocultar' : '🚫 Mostrar'}
                  </button>
                  <button onClick={() => handleEditar(noticia)} className="btn btn-sm btn-info">✏️ Editar</button>
                  <button onClick={() => eliminarNoticia(noticia.newsId)} className="btn btn-sm btn-danger">🗑️ Eliminar</button>
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
