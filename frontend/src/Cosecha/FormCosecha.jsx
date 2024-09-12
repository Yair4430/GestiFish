import axios from 'axios';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const FormCosecha = ({ buttonForm, cosecha, URI, updateTextButton, getAllCosecha }) => {
    const [Fec_Cosecha, setFec_Cosecha] = useState('');
    const [Can_Peces, setCan_Peces] = useState('');
    const [Pes_Eviscerado, setPes_Eviscerado] = useState('');
    const [Pes_Viscerado, setPes_Viscerado] = useState('');
    const [Por_Visceras, setPor_Visceras] = useState('');
    const [Id_Responsable, setId_Responsable] = useState('');
    const [Id_Siembra, setId_Siembra] = useState('');
    const [Hor_Cosecha, setHor_Cosecha] = useState('');
    const [Vlr_Cosecha, setVlr_Cosecha] = useState('');
    const [Obs_Cosecha, setObs_Cosecha] = useState('');
    const [DatosResponsable, setDatosResponsable] = useState([]);
    const [DatosSiembra, setDatosSiembra] = useState([]);

    const sendForm = async (e) => {
        e.preventDefault();
        try {
            const data = {
                Fec_Cosecha,
                Can_Peces,
                Pes_Eviscerado,
                Pes_Viscerado,
                Por_Visceras,
                Id_Responsable,
                Id_Siembra,
                Hor_Cosecha,
                Vlr_Cosecha,
                Obs_Cosecha
            };

            if (buttonForm === 'Actualizar') {
                await axios.put(`${URI}${cosecha.Id_Cosecha}`, data);
                Swal.fire({
                    title: 'Actualizado',
                    text: '¡Registro actualizado exitosamente!',
                    icon: 'success'
                }).then(() => {
                // updateTextButton('Enviar');
                clearForm(); // Limpiar el formulario después de la actualización
                getAllCosecha()
                $('#modalForm').modal('hide');
                })
            } else if (buttonForm === 'Enviar') {
                const respuestaApi = await axios.post(URI, data);
                Swal.fire({
                    title: 'Guardado',
                    text: '¡Registro guardado exitosamente!',
                    icon: 'success'
                });
                if (respuestaApi.status === 201) {
                    clearForm();
                }
            }

            getAllCosecha(); // Refrescar la lista después de la operación
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo guardar el registro de cosecha.',
                icon: 'error'
            });
        }
    };

    const clearForm = () => {
        setFec_Cosecha('');
        setCan_Peces('');
        setPes_Eviscerado('');
        setPes_Viscerado('');
        setPor_Visceras('');
        setId_Responsable('');
        setId_Siembra('');
        setHor_Cosecha('');
        setVlr_Cosecha('');
        setObs_Cosecha('');
    };

    const setData = () => {
        setFec_Cosecha(cosecha.Fec_Cosecha);
        setCan_Peces(cosecha.Can_Peces);
        setPes_Eviscerado(cosecha.Pes_Eviscerado);
        setPes_Viscerado(cosecha.Pes_Viscerado);
        setPor_Visceras(cosecha.Por_Visceras);
        setId_Responsable(cosecha.Id_Responsable);
        setId_Siembra(cosecha.Id_Siembra);
        setHor_Cosecha(cosecha.Hor_Cosecha);
        setVlr_Cosecha(cosecha.Vlr_Cosecha);
        setObs_Cosecha(cosecha.Obs_Cosecha);
    };

    useEffect(() => {
        const getResponsable = async () => {
            try {
                const response = await axios.get(process.env.ROUTER_PRINCIPAL + '/responsable/');
                setDatosResponsable(response.data);
            } catch (error) {
                console.error('Error al obtener responsables:', error);
            }
        };

        const getSiembras = async () => {
            try {
                const response = await axios.get(process.env.ROUTER_PRINCIPAL + '/siembra/');
                setDatosSiembra(response.data);
            } catch (error) {
                console.error('Error al obtener siembras:', error);
            }
        };

        getResponsable();
        getSiembras();
    }, []);

    useEffect(() => {
        if (cosecha) {
            setData();
        }
    }, [cosecha]);

    return (
        <>
                {/*<div className="card-header text-dark" style={{ backgroundColor: '#adaca9' }}>
                    <h1 className="text-center">
                        {buttonForm === 'Actualizar' ? 'Actualizar Cosecha' : 'Registrar Cosecha'}
                    </h1>
                </div>*/}
                <div className="card-body">
                    <form id="cosechaForm" onSubmit={sendForm} className="fw-bold m-2">
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Fec_Cosecha" className="form-label">Fecha de Cosecha:</label>
                                    <input className="form-control" type="date" id="Fec_Cosecha" value={Fec_Cosecha} onChange={(e) => setFec_Cosecha(e.target.value)} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Can_Peces" className="form-label">Cantidad de Peces:</label>
                                    <input className="form-control" type="number" id="Can_Peces" value={Can_Peces} onChange={(e) => setCan_Peces(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Pes_Eviscerado" className="form-label">Peso Eviscerado:</label>
                                    <input className="form-control" type="number" id="Pes_Eviscerado" value={Pes_Eviscerado} onChange={(e) => setPes_Eviscerado(e.target.value)} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Pes_Viscerado" className="form-label">Peso Viscerado:</label>
                                    <input className="form-control" type="number" id="Pes_Viscerado" value={Pes_Viscerado} onChange={(e) => setPes_Viscerado(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Por_Visceras" className="form-label">Porcentaje de Vísceras:</label>
                                    <input className="form-control" type="number" id="Por_Visceras" value={Por_Visceras} onChange={(e) => setPor_Visceras(e.target.value)} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Id_ResponsableSelect" className="form-label">Nombre Responsable:</label>
                                    <select className="form-control" id="Id_ResponsableSelect" value={Id_Responsable} onChange={(e) => setId_Responsable(e.target.value)} required>
                                        <option value="">Selecciona uno...</option>
                                        {DatosResponsable.map((responsable) => (
                                            <option key={responsable.Id_Responsable} value={responsable.Id_Responsable}>
                                                {responsable.Nom_Responsable}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Id_SiembraSelect" className="form-label">Fecha Siembra:</label>
                                    <select className="form-control" id="Id_SiembraSelect" value={Id_Siembra} onChange={(e) => setId_Siembra(e.target.value)} required>
                                        <option value="">Selecciona uno...</option>
                                        {DatosSiembra.map((siembra) => (
                                            <option key={siembra.Id_Siembra} value={siembra.Id_Siembra}>
                                                {siembra.Fec_Siembra}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Hor_Cosecha" className="form-label">Hora de Cosecha:</label>
                                    <input className="form-control" type="time" id="Hor_Cosecha" value={Hor_Cosecha} onChange={(e) => setHor_Cosecha(e.target.value)} required />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Vlr_Cosecha" className="form-label">Valor de Cosecha:</label>
                                    <input className="form-control" type="number" id="Vlr_Cosecha" value={Vlr_Cosecha} onChange={(e) => setVlr_Cosecha(e.target.value)} required />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label htmlFor="Obs_Cosecha" className="form-label">Observaciones:</label>
                                    <textarea className="form-control" id="Obs_Cosecha" value={Obs_Cosecha} onChange={(e) => setObs_Cosecha(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <button type="submit" id="boton" className="btn btn-primary btn-block m-2">
                                {buttonForm === 'Actualizar' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-repeat" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                        <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
                                        <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
                                    </svg>
                                )}
                                {buttonForm === 'Enviar' && (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-send" viewBox="0 0 16 16" style={{ marginRight: '8px' }}>
                                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
                                    </svg>
                                )}
                                {buttonForm}
                            </button>
                        </div>
                    </form>
                </div>
        </>
    );
    
};

export default FormCosecha;