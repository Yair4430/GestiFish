import axios from 'axios';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import WriteTable from '../Tables/Data-Tables.jsx';
import FormEspecie from './FormEspecie';
import jsPDF from "jspdf"; // Añade jsPDF para exportar a PDF
import * as XLSX from 'xlsx'; // Añade XLSX para exportar a Excel


const URI = process.env.ROUTER_PRINCIPAL + '/especie/';
const PATH_FOTOS = process.env.ROUTER_FOTOS;

const CrudEspecie = () => {
    const [EspecieList, setEspecieList] = useState([]);
    const [buttonForm, setButtonForm] = useState('Enviar');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [especie, setEspecie] = useState({
        Id_Especie: '',
        Nom_Especie: '',
        Car_Especie: '',
        Tam_Promedio: '',
        Den_Especie: '',
        Img_Especie: null
    });

    useEffect(() => {
        getAllEspecies();
    }, []);

    const getAllEspecies = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('usuario'));
            const respuesta = await axios.get(URI, {
              headers: { Authorization: `Bearer ${user.tokenUser }` },
            });
            if (respuesta.status === 200) {
                setEspecieList(respuesta.data);
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching especies:', error.response?.status || error.message);
        }
    };

    const getEspecie = async (Id_Especie) => {
        setButtonForm('Enviar');
        try {
            const user = JSON.parse(localStorage.getItem('usuario'));
            const respuesta = await axios.get(`${URI}/${Id_Especie}`, {
              headers: { Authorization: `Bearer ${user.tokenUser }` },
            });
            if (respuesta.status === 200) {
                setButtonForm('Actualizar');
                setEspecie({ ...respuesta.data });
                // Mostrar el modal
                const modalElement = document.getElementById('modalForm');
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            } else {
                console.warn('HTTP Status:', respuesta.status);
            }
        } catch (error) {
            console.error('Error fetching especie:', error.response?.status || error.message);
        }
    };

    const updateTextButton = (texto) => {
        setButtonForm(texto);
    };

    const deleteEspecie = async (Id_Especie) => {      
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
                await axios.delete(`${URI}/${Id_Especie}`,{
                    headers: { Authorization: `Bearer ${user.tokenUser }` },
                  });
                eliminar(Id_Especie);
                Swal.fire(
                    'Eliminado!',
                    'El registro ha sido eliminado.',
                    'success'
                );
                window.location.reload();
            }
        } catch (error) {
            console.error('Error deleting Cosecha:', error);
            Swal.fire('Error', 'No se puede eliminar la Especie porque pertenece a un registro de otro formulario.', 'error');
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
        const ws = XLSX.utils.json_to_sheet(EspecieList.map((especie) => ({
            Nombre: especie.Nom_Especie,
            Características: especie.Car_Especie,
            'Tamaño Promedio': especie.Tam_Promedio,
            Densidad: especie.Den_Especie,
            Imagen: especie.Img_Especie ? `${PATH_FOTOS}/${especie.Img_Especie}` : 'No Image'
        })));

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Especies');
        XLSX.writeFile(wb, 'Especies.xlsx');
    };

    const exportToSQL = () => {
        let sqlStatements = `CREATE TABLE IF NOT EXISTS Especies (
            Id_Especie INT AUTO_INCREMENT PRIMARY KEY,
            Nom_Especie VARCHAR(255),
            Car_Especie TEXT,
            Tam_Promedio VARCHAR(255),
            Den_Especie VARCHAR(255),
            Img_Especie VARCHAR(255)
        );\n\n`;
    
        sqlStatements += "INSERT INTO Especies (Nom_Especie, Car_Especie, Tam_Promedio, Den_Especie, Img_Especie) VALUES \n";
    
        sqlStatements += EspecieList.map((especie) => {
    
            // Maneja valores null o undefined de manera adecuada
            const nomEspecie = especie.Nom_Especie ? String(especie.Nom_Especie).replace(/'/g, "''") : '';
            const carEspecie = especie.Car_Especie ? String(especie.Car_Especie).replace(/'/g, "''") : '';
            const tamPromedio = especie.Tam_Promedio ? String(especie.Tam_Promedio).replace(/'/g, "''") : '';
            const denEspecie = especie.Den_Especie ? String(especie.Den_Especie).replace(/'/g, "''") : '';
            const imgEspecie = especie.Img_Especie ? `${PATH_FOTOS}/${especie.Img_Especie}` : '';
    
            // Retorna la línea SQL con todos los campos
            return `('${nomEspecie}', '${carEspecie}', '${tamPromedio}', '${denEspecie}', '${imgEspecie}')`;
        }).join(",\n") + ";";
    
        // Imprimir el script SQL en la consola
        console.log(sqlStatements);
    
        // Opción para descargarlo como un archivo SQL
        const blob = new Blob([sqlStatements], { type: 'text/sql' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'Especies.sql';
        link.click();
    };
    
    const exportToPDF = () => {
        const doc = new jsPDF();
        const title = "Especies";
        const pageWidth = doc.internal.pageSize.getWidth(); 
        const titleFontSize = 22; 
        doc.setFontSize(titleFontSize);
        doc.setFont('helvetica', 'bold'); 
        const textWidth = doc.getTextWidth(title); 
        const xOffset = (pageWidth - textWidth) / 2; 
        doc.text(title, xOffset, 20); 
        
        // Construir el cuerpo de la tabla sin la imagen
        const tableBody = EspecieList.map((especie) => [
            especie.Nom_Especie,
            especie.Car_Especie,
            especie.Tam_Promedio,
            especie.Den_Especie,
            '' // Dejar el espacio de la imagen vacío en el array
        ]);
    
        doc.autoTable({
            head: [['Nombre', 'Características', 'Tamaño Promedio', 'Densidad', 'Imagen']],
            body: tableBody,
            startY: 30, 
            theme: 'grid', 
            headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0] },
            styles: { cellPadding: 2, fontSize: 10, minCellHeight: 10 },
            didDrawCell: function (data) {
                // Verificar si es la columna de la imagen
                if (data.column.index === 4 && data.cell.section === 'body') {
                    const img = EspecieList[data.row.index].Img_Especie;
                    if (img) {
                        const imgWidth = data.cell.width - 4; // Ajustar el ancho de la imagen al ancho de la celda menos un pequeño margen
                        const imgHeight = data.cell.height - 4; // Ajustar el alto de la imagen al alto de la celda menos un pequeño margen
                        doc.addImage(`${PATH_FOTOS}/${img}`, 'PNG', data.cell.x + 2, data.cell.y + 2, imgWidth, imgHeight);
                    }
                }
            }
        });
    
        doc.save('Especies.pdf');
    };

    const handleAddClick = () => {
        setShowForm(prevShowForm => !prevShowForm);
        if (!showForm) {
            setEspecie({
                Id_Especie: '',
                Nom_Especie: '',
                Car_Especie: '',
                Tam_Promedio: '',
                Den_Especie: '',
                Img_Especie: null
            });
            setButtonForm('Enviar');
        }
        setIsModalOpen(true);
    };

    const closeModal = () => setIsModalOpen(false);

    const handleEdit = (Id_Especie) => {
        getEspecie(Id_Especie);
        setIsModalOpen(true);
    };

    const handleDelete = (Id_Especie) => {
        deleteEspecie(Id_Especie);
    };

    const data = EspecieList.map((especie) => [
        especie.Nom_Especie,
        especie.Car_Especie,
        especie.Tam_Promedio,
        especie.Den_Especie,
        especie.Img_Especie ? (
            `<img width="80px" src="${PATH_FOTOS}/${especie.Img_Especie}" alt="Imagen de la especie" />`
        ) : (
            'No Image'
        ),
        `
        <a class='text-primary align-middle btn-edit' data-id='${especie.Id_Especie}' onClick={handleAddClick}>
          <i class="fa-solid fa-pen-to-square"></i> 
        </a>
        <a class='text-danger align-middle m-1 btn-delete' data-id='${especie.Id_Especie}'>
          <i class="fa-solid fa-trash-can"></i> 
        </a>
      `
    ]);

    const titles = [
        "Nombre", "Características", "Tamaño Promedio", "Densidad", "Imagen", "Acciones"
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
                }}>Especie</h2>
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
                            <div className="modal-content">
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
                                        {buttonForm === 'Actualizar' ? 'Actualizar Especie' : 'Registrar Especie'}
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
                                    <FormEspecie 
                                        buttonForm={buttonForm} 
                                        especie={especie} 
                                        URI={URI} 
                                        updateTextButton={updateTextButton} 
                                        getAllEspecies={getAllEspecies} 
                                        closeModal={closeModal}
                                        /*closeModal ={() => {
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
}

export default CrudEspecie;