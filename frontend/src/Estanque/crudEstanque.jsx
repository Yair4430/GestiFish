import axios from 'axios'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FormEstanque from './formEstanque'
import FormQueryEstanque from './formQueryEstanque'
import Swal from 'sweetalert2'
import BarraNavegacionPrivada from '../home/barraNavegacionPrivada'

const URI = process.env.ROUTER_PRINCIPAL + '/estanque/'
const PATH_FOTOS = process.env.ROUTER_FOTOS

const CrudEstanque = () => {
    const [EstanqueList, setEstanqueList] = useState([])
    const [buttonForm, setButtonForm] = useState('Enviar')
    const [estanque, setEstanque] = useState({
        Id_Estanque: '',
        Nom_Estanque: '',
        Esp_Agua: '',
        Tip_Estanque: '',
        Lar_Estanque: '',
        Anc_Estanque: '',
        Des_Estanque: '',
        Img_Estanque: null,
        Rec_Agua: ''
    })

    useEffect(() => {
        getAllEstanques();
    }, []);
    
    const getAllEstanques = async () => {
        try {
            const respuesta = await axios.get(URI)
            if (respuesta.status === 200) {
                setEstanqueList(respuesta.data)
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching estanques:', error.response?.status || error.message);
        }
    }    

    const getEstanque = async (Id_Estanque) => {
        setButtonForm('Enviar');
        try {
            const respuesta = await axios.get(URI + Id_Estanque);
            if (respuesta.status === 200) {
                setButtonForm('Actualizar');
                setEstanque({ ...respuesta.data });
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching estanque:', error.response?.status || error.message);
        }
    };

    const updateTextButton = (texto) => {
        setButtonForm(texto)
    }

    const deleteEstanque = (Id_Estanque) => {
        Swal.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir esto!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, borrar!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const respuesta = await axios.delete(URI + Id_Estanque);
                    if (respuesta.status === 200) {
                        Swal.fire({
                            title: "¡Borrado!",
                            text: "Borrado exitosamente",
                            icon: "success"
                        });
                        getAllEstanques(); // Refresh the list after deletion
                    } else {
                        console.warn('HTTP Status:', respuesta.status);
                    }
                } catch (error) {
                    console.error('Error deleting estanque:', error.response?.status || error.message);
                }
            }
        });
    };

    return (
        <>
        <BarraNavegacionPrivada />
            <table className="table table-bordered border-info text-center mt-4" style={{ border: "3px solid" }}>
                <thead>
                    <tr>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Número</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Nombre</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Espejo de Agua</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Tipo</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Largo</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Ancho</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Descripción</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Imagen</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Recambio de agua</th>
                        <th className='border-info align-middle' style={{ border: "3px solid" }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {EstanqueList.map((estanque) => (
                        <tr key={estanque.Id_Estanque} className='border-info font-monospace' style={{ border: "3px solid" }}>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Id_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Nom_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Esp_Agua}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Tip_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Lar_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Anc_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Des_Estanque}</td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>
                                <img width="80px" src={`${PATH_FOTOS}/${estanque.Img_Estanque}`} alt="Imagen del estanque" />
                            </td>
                            <td className='border-info align-middle' style={{ border: "3px solid" }}>{estanque.Rec_Agua}</td>
                            <td>
                                <button className='btn btn-info align-middle' onClick={() => getEstanque(estanque.Id_Estanque)}>
                                    <i className="fa-solid fa-pen-to-square"></i> Editar
                                </button>
                                <button className='btn btn-info align-middle m-2' onClick={() => deleteEstanque(estanque.Id_Estanque)}>
                                    <i className="fa-solid fa-trash-can"></i> Borrar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr />
            <FormEstanque  getAllEstanques={getAllEstanques} buttonForm={buttonForm} estanque={estanque} URI={URI} updateTextButton={updateTextButton} />
            <hr />
            <FormQueryEstanque URI={URI} getEstanque={getEstanque} deleteEstanque={deleteEstanque} buttonForm={buttonForm} />
        </>
    )
}

export default CrudEstanque
