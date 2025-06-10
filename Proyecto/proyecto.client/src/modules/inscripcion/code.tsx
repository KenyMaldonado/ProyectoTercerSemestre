// ... existing code ...
// Antes del return del componente principal:
const [fase, setFase] = useState<'inicio' | 'formulario'>('inicio');
const [email, setEmail] = useState("");
const [preInscripcionId, setPreInscripcionId] = useState<number | null>(null);
const [datosRecuperados, setDatosRecuperados] = useState(false);
const [formData, setFormData] = useState({});

return (
  <Scoped>
    <div className="inscripcion-wrapper">
      {fase === 'inicio' && (
        <Row className="gx-4">
          <Col md={6}>
            <EmailRequest
              onEmailSent={(id, correo) => {
                setPreInscripcionId(id);
                setEmail(correo);
                setFase('formulario');
              }}
            />
          </Col>
          <Col md={6}>
            <CodeVerification
              preInscripcionId={preInscripcionId}
              setFormData={setFormData}
              onValidated={(id, correo) => {
                setPreInscripcionId(id);
                setDatosRecuperados(true);
                setEmail(correo || "");
                setFase('formulario');
              }}
            />
          </Col>
        </Row>
      )}
      {fase === 'formulario' && (
        <StepContent
          formData={formData}
          preInscripcionId={preInscripcionId}
          datosRecuperados={datosRecuperados}
          email={email}
          // ...otros props necesarios
        />
      )}
    </div>
  </Scoped>
);
// ... existing code ...