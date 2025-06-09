import './Inicio.css';
import { useEffect, useState } from 'react';

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

const Inicio = () => {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const res = await fetch('https://apitorneosmeso-feh5hqeqe5bresgm.eastus-01.azurewebsites.net/api/AdditionalFeaturesControllers/GetNews', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
            Accept: '*/*',
          },
        });
        const data = await res.json();
        if (data.success) {
          const visibles = data.data.filter((n: Noticia) => n.published);
          setNoticias(visibles);
        }
      } catch (error) {
        console.error('Error al obtener noticias:', error);
      }
    };
    fetchNoticias();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % noticias.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [noticias]);

  return (
    <div className="inicio-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div>
            <h1>🏆 Bienvenido a los Torneos de Fútbol</h1>
            <p>Organiza, gestiona y vive la pasión del deporte desde un solo lugar.</p>
          </div>
          <img
            src="https://static.wixstatic.com/media/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png/v1/fill/w_124,h_112,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png"
            alt="Jugador principal"
          />
        </div>
      </section>

      {/* CARRUSEL PERSONALIZADO */}
      <section className="noticias">
        <h2 className="titulo-seccion">📰 Últimas Noticias</h2>
        <div className="carrusel-personalizado">
          <button
  className="flecha-carrusel izquierda"
  onClick={() => setCurrent((prev) => (prev - 1 + noticias.length) % noticias.length)}
>
  ←
</button>

<button
  className="flecha-carrusel derecha"
  onClick={() => setCurrent((prev) => (prev + 1) % noticias.length)}
>
  →
</button>


          {noticias.map((noticia, i) => {
            const offset = i - current;
            let scale = offset === 0 ? 1 : 0.85;
            let opacity = offset === 0 ? 1 : 0.4;

            return (
              <div
                key={noticia.newsId}
                className="tarjeta-noticia"
                style={{
                  transform: `translateX(${offset * 100}%) scale(${scale})`,
                  opacity,
                  zIndex: offset === 0 ? 2 : 1,
                }}
              >
                <img src={`${noticia.imageUrl}?t=${Date.now()}`} alt={noticia.title} />
                <h4>{noticia.title}</h4>
                <p>{noticia.content}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* MISIÓN Y VISIÓN */}
      <section className="mv-umes">
        <h2 className="titulo-seccion">MISIÓN Y VISIÓN</h2>

        <div className="tarjeta-mv">
          <img className="mv-img" src="https://i.ytimg.com/vi/sMW9HdCYsBs/hq720.jpg" alt="Imagen misión" />
          <div className="mv-info">
            <h3>Misión</h3>
            <p>
              Fomentar la práctica deportiva universitaria como parte integral de la formación,
              promoviendo valores como el respeto, la disciplina y el trabajo en equipo.
            </p>
          </div>
        </div>

        <div className="tarjeta-mv">
          <img className="mv-img" src="https://live.staticflickr.com/5304/5791802695_5289a4ed7a_b.jpg" alt="Imagen visión" />
          <div className="mv-info">
            <h3>Visión</h3>
            <p>
              Ser un departamento modelo en la promoción del deporte universitario,
              facilitando espacios de desarrollo físico y humano para toda la comunidad estudiantil.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;
