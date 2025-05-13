import './Inicio.css';

const Inicio = () => {
  return (
    <div className="inicio-container">
      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <div>
            <h1>🏆 Bienvenido a los Torneos de Fútbol</h1>
            <p>Organiza, gestiona y vive la pasión del deporte desde un solo lugar.</p>
          </div>
          <img src="https://static.wixstatic.com/media/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png/v1/fill/w_124,h_112,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png" alt="Jugador principal" />
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="mv-umes">
  <h2 className="titulo-seccion">MISIÓN Y VISIÓN</h2>

  <div className="tarjeta-mv" data-aos="fade-right">
    <img className="mv-img" src="https://i.ytimg.com/vi/sMW9HdCYsBs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD3E5rr4vS0JfeznAvmbRaN7udYSw" alt="Imagen misión" />
    <div className="mv-info">
      <h3>Misión</h3>
      <p>
        Fomentar la práctica deportiva universitaria como parte integral de la formación,
        promoviendo valores como el respeto, la disciplina y el trabajo en equipo.
      </p>
    </div>
  </div>

  <div className="tarjeta-mv" data-aos="fade-left">
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

