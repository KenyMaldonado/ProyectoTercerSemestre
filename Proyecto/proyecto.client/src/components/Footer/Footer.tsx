import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles["footer-logos"]}>
        <img src="https://static.wixstatic.com/media/9726ef_c411753c1d2f444f9d63f94c85737f55~mv2.png/v1/fill/w_270,h_272,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9726ef_c411753c1d2f444f9d63f94c85737f55~mv2.png" alt="UMES" />


        
        <img className={styles["logo-donbosco"]}
        src="https://static.wixstatic.com/media/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png/v1/fill/w_220,h_196,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/1724d0_cc6ccfe68c90471496470c9397aa6b3d~mv2.png"
        alt="Don Bosco"/>


        <img src="https://static.wixstatic.com/media/9726ef_5f3def8216544beda3fc808ea60c8010~mv2.png/v1/fill/w_342,h_196,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/9726ef_5f3def8216544beda3fc808ea60c8010~mv2.png" alt="ISES" />
      </div>

      <div className={styles["footer-contacto"]}>
        <p><span>📧</span> info@umes.edu.gt</p>
        <p><span>📞</span> 2413 8021</p>
      </div>

      <div className={styles["footer-redes"]}>
        <a href="#"><i className="fab fa-facebook-f"></i></a>
        <a href="#"><i className="fab fa-instagram"></i></a>
        <a href="#"><i className="fab fa-whatsapp"></i></a>
        <a href="#"><i className="fab fa-youtube"></i></a>
        <a href="#"><i className="fab fa-x-twitter"></i></a>
        <a href="#"><i className="fab fa-linkedin-in"></i></a>
        <a href="#"><i className="fab fa-tiktok"></i></a>
      </div>

      <p className={styles["footer-copy"]}>
        Política de Privacidad - Universidad Mesoamericana
      </p>
    </footer>
  );
};

export default Footer;

