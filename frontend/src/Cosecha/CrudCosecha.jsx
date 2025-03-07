import axios from 'axios';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import WriteTable from '../Tables/Data-Tables.jsx'; // Asegúrate de tener este componente para la tabla de datos
import FormCosecha from './FormCosecha'; // Asegúrate de tener este componente para el formulario de cosecha
import jsPDF from "jspdf";
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const URI = process.env.ROUTER_PRINCIPAL + '/cosecha/';

const CrudCosecha = () => {
    const [CosechaList, setCosechaList] = useState([]);
    const [buttonForm, setButtonForm] = useState('Enviar');
    const [showForm, setShowForm] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cosecha, setCosecha] = useState({
        Id_Cosecha: '',
        Fec_Cosecha: '',
        Can_Peces: '',
        Pes_Eviscerado: '',
        Pes_Viscerado: '',
        Por_Visceras: '',
        Id_Responsable: '',
        Id_Siembra: '',
        Hor_Cosecha: '',
        Vlr_Cosecha: '',
        Obs_Cosecha: ''
    });

    useEffect(() => {
        getAllCosecha();
    }, []);

    const getAllCosecha = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('usuario'));
            const respuesta = await axios.get(URI, {
              headers: { Authorization: `Bearer ${user.tokenUser }` },
            });

            if (respuesta.status >= 200 && respuesta.status < 300) {
                setCosechaList(respuesta.data);
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching cosecha:', error.response?.status || error.message);
        }
    };

    const getCosecha = async (Id_Cosecha) => {
        setButtonForm('Enviar');
        try {
            const user = JSON.parse(localStorage.getItem('usuario'));
            const respuesta = await axios.get(`${URI}/${Id_Cosecha}`, {
              headers: { Authorization: `Bearer ${user.tokenUser }` },
            });
            if (respuesta.status >= 200 && respuesta.status < 300) {
                setButtonForm('Actualizar');
                setCosecha({ ...respuesta.data });
                const modalElement = document.getElementById('modalForm');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching cosecha:', error.response?.status || error.message);
        }
    };

    const updateTextButton = (texto) => {
        setButtonForm(texto);
    };

    const deleteCosecha = async (Id_Cosecha) => {      
        try {
            // Muestra un cuadro de confirmación estilizado
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esta acción!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo!',
                cancelButtonText: 'Cancelar'
            });
    
            // Si el usuario confirma la acción
            if (result.isConfirmed) {
                const user = JSON.parse(localStorage.getItem('usuario'));
                await axios.delete(`${URI}/${Id_Cosecha}`,{
                    headers: { Authorization: `Bearer ${user.tokenUser }` },
                  });
                eliminar(Id_Cosecha);
                Swal.fire(
                    'Eliminado!',
                    'El registro ha sido eliminado.',
                    'success'
                );
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting Cosecha:', error);
            Swal.fire('Error', 'No se pudo eliminar el registro', 'error');
        }
    };

    function eliminar(id) {
        const element = document.querySelectorAll(`.btn-delete[data-id='${id}']`)[0];
        if (element) {
          element.parentNode.parentNode.remove();
        }
          
      }
      // Agrega un event listener para los botones de eliminación
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.getAttribute('data-id');
          eliminar(id);
        }); 
      });

    // Función para exportar a Excel
    const exportToExcel = () => {
          const ws = XLSX.utils.json_to_sheet(CosechaList.map((cosecha) => ({
            Fecha: cosecha.Fec_Cosecha,
            'Cantidad Peces': cosecha.Can_Peces,
            'Peso Eviscerado': cosecha.Pes_Eviscerado,
            'PesoViscerado': cosecha.Pes_Viscerado,
            'Porcentaje Viceras': cosecha.Por_Visceras,
            'Fecha Siembra': cosecha.siembra.Fec_Siembra,
            'Hora Cosecha': cosecha.Hor_Cosecha,
            'Valor Cosecha': cosecha.Vlr_Cosecha,
            'Observaciones': cosecha.Obs_Cosecha,
            'Nombre Responsable': cosecha.responsable.Nom_Responsable // Aquí
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Cosechas');
        XLSX.writeFile(wb, 'Cosechas.xlsx');
    };

    // Función para exportar a SQL
    const exportToSQL = () => {
        let sqlStatements = `CREATE TABLE IF NOT EXISTS Cosechas (
            Id_Cosecha INT AUTO_INCREMENT PRIMARY KEY,
            Fec_Cosecha DATE,
            Can_Peces INT,
            Pes_Eviscerado FLOAT,
            Pes_Viscerado FLOAT,
            Por_Visceras FLOAT,
            Fec_Siembra DATE,
            Hor_Cosecha TIME,
            Vlr_Cosecha FLOAT,
            Obs_Cosecha TEXT,
            Nom_Responsable VARCHAR(255)
        );\n\n`;
    
        sqlStatements += "INSERT INTO Cosechas (Fec_Cosecha, Can_Peces, Pes_Eviscerado, Pes_Viscerado, Por_Visceras, Fec_Siembra, Hor_Cosecha, Vlr_Cosecha, Obs_Cosecha, Nom_Responsable) VALUES \n";
        
        sqlStatements += CosechaList.map((cosecha) => {
            return `('${cosecha.Fec_Cosecha}', ${cosecha.Can_Peces}, ${cosecha.Pes_Eviscerado}, ${cosecha.Pes_Viscerado}, ${cosecha.Por_Visceras}, '${cosecha.siembra.Fec_Siembra}', '${cosecha.Hor_Cosecha}', ${cosecha.Vlr_Cosecha}, '${cosecha.Obs_Cosecha.replace(/'/g, "''")}', '${cosecha.responsable.Nom_Responsable.replace(/'/g, "''")}')`; // Aquí
        }).join(",\n") + ";";
    
        // Imprimir el script SQL en la consola
        console.log(sqlStatements);
    
        // Opción para descargarlo como un archivo SQL
        const blob = new Blob([sqlStatements], { type: 'text/sql' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Cosechas.sql';
        link.click();
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // Título de la tabla
        const title = "Cosechas";
        const pageWidth = doc.internal.pageSize.getWidth(); // Obtener el ancho de la página
        const titleFontSize = 22; // Tamaño de fuente más grande
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold'); // Poner el título en negrita
        const textWidth = doc.getTextWidth(title); // Ancho del texto
        const xOffset = (pageWidth - textWidth) / 2; // Calcular la posición para centrar el texto
        doc.text(title, xOffset, 20); // Posición del título centrado
    
        const tableBody = CosechaList.map((cosecha) => [
            cosecha.Fec_Cosecha,
            cosecha.Can_Peces,
            cosecha.Pes_Eviscerado,
            cosecha.Pes_Viscerado,
            cosecha.Por_Visceras,
            cosecha.siembra.Fec_Siembra,
            cosecha.Hor_Cosecha,
            cosecha.Vlr_Cosecha,
            cosecha.Obs_Cosecha,
            cosecha.responsable.Nom_Responsable  // Aquí
        ]);
    
        doc.autoTable({
            head: [["Fecha Cosecha", "Cantidad Peces", "Peso Eviscerado", "Peso Viscerado",
                "Porcentaje Viceras", "Fecha Siembra", "Hora Cosecha", "Valor Cosecha",
                "Observaciones", "Nombre Responsable"]],
            body: tableBody,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            styles: { cellPadding: 2, fontSize: 10, minCellHeight: 10 },
            columnStyles: {
                0: { cellWidth: 25 },
                1: { cellWidth: 15 },
                2: { cellWidth: 15 },
                3: { cellWidth: 15 },
                4: { cellWidth: 15 },
                5: { cellWidth: 23 },
                6: { cellWidth: 20 },
                7: { cellWidth: 20 },
                8: { cellWidth: 15 },
                9: { cellWidth: 18 }
            }
        });
    
        doc.save("Cosechas.pdf");
    };
    

    const handleAddClick = () => {
        setShowForm(prevShowForm => !prevShowForm);
        if (!showForm) {
            setCosecha({
                Fec_Cosecha: '',
                Can_Peces: '',
                Pes_Eviscerado: '',
                Pes_Viscerado: '',
                Por_Visceras: '',
                Id_Responsable: '',
                Id_Siembra: '',
                Hor_Cosecha: '',
                Vlr_Cosecha: '',
                Obs_Cosecha: ''
            });
            setButtonForm('Enviar');
        }

        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleEdit = (Id_Cosecha) => {
        getCosecha(Id_Cosecha);
        setIsModalOpen(true);
    };

    const handleDelete = (Id_Cosecha) => {
        deleteCosecha(Id_Cosecha);
    };

    const data = CosechaList.map((cosecha) => [
        cosecha.Fec_Cosecha,
        cosecha.Can_Peces,
        cosecha.Pes_Eviscerado,
        cosecha.Pes_Viscerado,
        cosecha.Por_Visceras,
        cosecha.siembra.Fec_Siembra,
        cosecha.Hor_Cosecha,
        cosecha.Vlr_Cosecha,
        cosecha.Obs_Cosecha,
        cosecha.responsable.Nom_Responsable, // Aquí
        `
          <a class='text-primary align-middle btn-edit' data-id='${cosecha.Id_Cosecha}' onClick={handleAddClick}>
            <i class="fa-solid fa-pen-to-square"></i> 
          </a>
          <a class='text-danger align-middle m-1 btn-delete' data-id='${cosecha.Id_Cosecha}'>
            <i class="fa-solid fa-trash-can"></i> 
          </a>
        
        `
    ]);
    
    
    const titles = [
       "Fecha Cosecha", "Cantidad Peces", "Peso Eviscerado", "Peso Viscerado",
        "Porcentaje Viceras", "Fecha Siembra", "Hora Cosecha", "Valor Cosecha",
        "Observaciones", "Nombre Responsable", "Acciones"
    ];

    return (
        <>
        <div style={{ marginTop: '50px' }}> {/* Aquí ajustas la distancia con marginTop */}
            <div
                style={{
                    position: 'absolute', // Permite posicionar el botón de manera independiente
                    left: '260px', // Ajusta la posición horizontal
                    top: '60px', // Ajusta la posición vertical
                    display: 'flex',
                    alignItems: 'center'
                }}
            >            
                {/* Ícono para agregar */}
                <a
                    onClick={handleAddClick}
                    style={{
                        fontSize: '18px',
                        color: 'green',
                        float: 'right',
                        margin: '120px 2px',
                        // display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer'
                    }}
                >
                    <i className="bi bi-plus-circle"
                        style={{ marginRight: '10px', fontSize: '25px' }}>
                    </i>
                    Agregar
                </a>
            </div>

            <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: 'auto' 
                }}>

                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',  
                    gap: '25px',  // Espacio entre los botones
                    position: 'absolute', 
                    top: '118px', 
                    right: '1041px',  
                    transform: 'translateY(-50%)'  
                    }}>

{/* Botón para exportar a PDF (rojo) */}
<a
                        className="text-danger"
                        onClick={exportToPDF}
                        style={{
                            width: '30px',
                            height: '45px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '-20px'
                        }}
                        title="Exportar a PDF">
                        <i className="bi bi-filetype-pdf" style={{ fontSize: '25px' }}></i>
                    </a>

                    {/* Botón para exportar a Excel (verde) */}
                    <a
                        className="text-success"
                        onClick={exportToExcel}
                        style={{
                            width: '30px',
                            height: '45px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '-20px'
                        }}
                        title="Exportar a EXCEL">
                        <i className="bi bi-file-earmark-excel" style={{ fontSize: '25px' }}></i>
                    </a>

                    {/* Botón para exportar a SQL (gris) */}
                    <a
                        className="text-secondary"
                        onClick={exportToSQL}
                        style={{
                            width: '30px',
                            height: '45px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: '-50px'
                        }}
                        title="Exportar a SQL">
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-filetype-sql" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5zM0 14.841a1.13 1.13 0 0 0 .401.823q.194.162.478.252c.284.09.411.091.665.091q.507 0 .858-.158.355-.159.54-.44a1.17 1.17 0 0 0 .187-.656q0-.336-.135-.56a1 1 0 0 0-.375-.357 2 2 0 0 0-.565-.21l-.621-.144a1 1 0 0 1-.405-.176.37.37 0 0 1-.143-.299q0-.234.184-.384.187-.152.513-.152.214 0 .37.068a.6.6 0 0 1 .245.181.56.56 0 0 1 .12.258h.75a1.1 1.1 0 0 0-.199-.566 1.2 1.2 0 0 0-.5-.41 1.8 1.8 0 0 0-.78-.152q-.44 0-.776.15-.337.149-.528.421-.19.273-.19.639 0 .302.123.524t.351.367q.229.143.54.213l.618.144q.31.073.462.193a.39.39 0 0 1 .153.325q0 .165-.085.29A.56.56 0 0 1 2 15.31q-.167.07-.413.07-.176 0-.32-.04a.8.8 0 0 1-.248-.115.58.58 0 0 1-.255-.384zm6.878 1.489-.507-.739q.264-.243.401-.6.138-.358.138-.806v-.501q0-.556-.208-.967a1.5 1.5 0 0 0-.589-.636q-.383-.225-.917-.225-.527 0-.914.225-.384.223-.592.636a2.14 2.14 0 0 0-.205.967v.5q0 .554.205.965.208.41.592.636a1.8 1.8 0 0 0 .914.222 1.8 1.8 0 0 0 .6-.1l.294.422h.788ZM4.262 14.2v-.522q0-.369.114-.63a.9.9 0 0 1 .325-.398.9.9 0 0 1 .495-.138q.288 0 .495.138a.9.9 0 0 1 .325.398q.115.261.115.63v.522q0 .246-.053.445-.053.196-.155.34l-.106-.14-.105-.147h-.733l.451.65a.6.6 0 0 1-.251.047.87.87 0 0 1-.487-.147.9.9 0 0 1-.32-.404 1.7 1.7 0 0 1-.11-.644m3.986 1.057h1.696v.674H7.457v-3.999h.79z" />
                        </svg>
                    </a>
                </div> 
            </div>
             
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginRight: '-70px'
                }}>
                <h2 style={{ 
                    fontWeight: 'bold',  // Texto en negrilla
                    position: 'relative', // Posicionamiento relativo para ajustar la posición
                    top: '10px'  // Ajusta este valor para bajar el texto
                }}>Cosecha</h2>
            </div>
     
                <WriteTable
                    titles={titles} 
                    data={data} 
                    onEditClick={handleEdit} 
                    onDeleteClick={handleDelete} 
                />

            {isModalOpen && (
                <div className="modal fade show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content border-0"> {/* Elimina el borde */}
                            <div className="modal-header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', width: '100%' }}>
                                <h5 
                                    className="modal-title" 
                                    id="modalFormLabel"
                                    style={{ 
                                        fontWeight: 'bold',  /* Negrita */
                                        fontSize: '28px',    /* Tamaño de texto más grande */
                                        margin: '0',         /* Elimina márgenes para evitar desalineación */
                                        textAlign: 'center', /* Centra el texto dentro del h5 */
                                        flex: 1              /* Hace que el h5 ocupe el espacio disponible */
                                    }} 
                                >
                                    {buttonForm === 'Actualizar' ? 'Actualizar Cosecha' : 'Registrar Cosecha'}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={closeModal} 
                                    aria-label="Close" 
                                    style={{ position: 'absolute', right: '35px' }} /* Ajusta la posición del botón */
                                ></button>
                            </div>
                            <div className="modal-body">
                                <FormCosecha
                                    buttonForm={buttonForm}
                                    cosecha={cosecha}
                                    URI={URI}
                                    updateTextButton={updateTextButton}
                                    getAllCosecha={getAllCosecha}
                                    closeModal={closeModal}
                                    /*closeModal={() => {
                                        const modalElement = document.getElementById('modalForm');
                                        const modal = window.bootstrap.Modal.getInstance(modalElement);
                                        modal.hide();
                                    }}*/
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </>
    );
};

export default CrudCosecha;