/*
  Archivo: script.js
  Ubicación: NOVAWEB/script.js
  Descripción: Contiene toda la lógica interactiva de la aplicación web.
*/

// 'DOMContentLoaded' es un evento que se dispara cuando todo el HTML ha sido cargado y procesado.
// Ponemos todo nuestro código dentro de este evento para asegurar que los elementos del HTML existen antes de intentar usarlos.
document.addEventListener('DOMContentLoaded', () => {

    // --- SECCIÓN DE REFERENCIAS A ELEMENTOS HTML ---
    // Guardamos en constantes los elementos del HTML con los que vamos a interactuar.
    const ivCara = document.getElementById('cara-container');
    const tvDialogo = document.getElementById('tvDialogo');

    // --- SECCIÓN DE LÓGICA DE ANIMACIÓN POR FOTOGRAMAS ---
    // Un array (lista) con las rutas de todas las imágenes que forman la animación.
    const framesAnimacion = [
        'animacion_cara/iot_1.png', 'animacion_cara/iot_2.png', 'animacion_cara/iot_3.png',
        'animacion_cara/iot_4.png', 'animacion_cara/iot_5.png', 'animacion_cara/iot_6.png'
    ];
    let frameActual = 0; // Variable para llevar la cuenta de en qué fotograma de la animación estamos.
    let animInterval = null; // Variable que controlará el temporizador de la animación.

    // Función para iniciar la animación.
    function iniciarAnimacion() {
        if (animInterval) return; // Si ya hay una animación corriendo, no hace nada.
        // setInterval ejecuta una función repetidamente cada cierto tiempo (en milisegundos).
        animInterval = setInterval(() => {
            // Avanzamos al siguiente fotograma. El '%' (módulo) hace que vuelva a 0 cuando llega al final de la lista.
            frameActual = (frameActual + 1) % framesAnimacion.length;
            // Cambiamos la imagen de fondo del div '#cara-container' por la imagen del fotograma actual.
            ivCara.style.backgroundImage = `url('${framesAnimacion[frameActual]}')`;
        }, 150); // Cambia de imagen cada 150 milisegundos.
    }

    // Función para detener la animación.
    function detenerAnimacion() {
        clearInterval(animInterval); // Detiene el temporizador.
        animInterval = null; // Limpia la variable de control.
        // Regresa la cara a la primera imagen (estado de reposo).
        ivCara.style.backgroundImage = `url('${framesAnimacion[0]}')`;
    }

    // Inicia la animación tan pronto como la página carga.
    iniciarAnimacion();

    // --- SECCIÓN DE INICIALIZACIÓN DE VOZ (SÍNTESIS Y RECONOCIMIENTO) ---
    const textToSpeech = window.speechSynthesis; // API del navegador para hablar (Text-to-Speech).
    // API del navegador para escuchar (Speech Recognition). Se incluye 'webkit' por compatibilidad con Chrome.
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let speechRecognizer;

    if (SpeechRecognition) { // Comprueba si el navegador soporta esta API.
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.lang = 'es-MX'; // Establece el idioma a español de México.
        speechRecognizer.continuous = false; // El micrófono se apaga después de un comando.
        speechRecognizer.interimResults = false; // No nos interesan los resultados parciales.
    } else {
        console.error("El reconocimiento de voz no es soportado por este navegador.");
    }

    // --- SECCIÓN DE LÓGICA DE AUDIO ---
    let mediaPlayer = null; // Variable para controlar el audio que se está reproduciendo.
    // Creamos objetos de Audio para cada archivo. Esto los precarga y prepara para ser reproducidos.
    const audios = {
        'amy_1': new Audio('audio/amy_1.wav'),
        'amy_2': new Audio('audio/amy_2.wav'),
        'amy_3': new Audio('audio/amy_3.wav')
    };

    // Función para reproducir un audio. Recibe la clave del audio a reproducir.
    function playMusic(audioKey) {
        stopMusic(); // Primero, detiene cualquier audio que ya esté sonando.
        mediaPlayer = audios[audioKey]; // Asigna el nuevo audio a la variable de control.
        mediaPlayer.play(); // Lo reproduce.
        mediaPlayer.onended = () => stopMusic(); // Cuando el audio termine, se llama a stopMusic.
    }

    // Función para detener la música.
    function stopMusic() {
        if (mediaPlayer) { // Si hay un audio reproduciéndose...
            mediaPlayer.pause(); // Lo pausa.
            mediaPlayer.currentTime = 0; // Lo rebobina al principio.
            mediaPlayer = null; // Limpia la variable de control.
        }
    }

    // Asignamos las funciones a los eventos 'click' de cada botón.
    document.getElementById('btnAudio1').addEventListener('click', () => playMusic('amy_1'));
    document.getElementById('btnAudio2').addEventListener('click', () => playMusic('amy_2'));
    document.getElementById('btnAudio3').addEventListener('click', () => playMusic('amy_3'));
    document.getElementById('btnSilencio').addEventListener('click', stopMusic);

    // --- SECCIÓN DE LÓGICA DE RECONOCIMIENTO DE VOZ ---
    // Cuando se hace clic (o se toca) la cara, se inicia el reconocimiento de voz.
    ivCara.addEventListener('click', () => {
        if (speechRecognizer) {
            try {
                // Detiene cualquier audio o voz antes de empezar a escuchar.
                stopMusic();
                textToSpeech.cancel();
                speechRecognizer.start(); // Inicia la escucha. La primera vez, pedirá permiso para el micrófono.
            } catch (e) {
                console.error("El reconocimiento de voz ya estaba activo.", e);
            }
        }
    });

    if (speechRecognizer) { // Asignamos los eventos solo si el navegador es compatible.
        // Se dispara cuando el micrófono empieza a escuchar.
        speechRecognizer.onstart = () => {
            detenerAnimacion(); // Detenemos la animación de la cara mientras escucha.
        };

        // Se dispara cuando el navegador ha transcrito lo que dijiste.
        speechRecognizer.onresult = (event) => {
            const comando = event.results[0][0].transcript.toUpperCase(); // Obtenemos el texto y lo convertimos a mayúsculas.
            procesarComando(comando); // Enviamos el texto a nuestra función para procesarlo.
        };

        // Se dispara si hay un error (ej. no se dio permiso para el micrófono).
        speechRecognizer.onerror = (event) => {
            console.error(`Error en el reconocimiento: ${event.error}`);
        };

        // Se dispara cuando la escucha termina.
        speechRecognizer.onend = () => {
            iniciarAnimacion(); // Reanudamos la animación de la cara.
        };
    }

    // --- SECCIÓN DE PROCESAMIENTO DE COMANDOS Y RESPUESTA ---
    // Función que decide qué hacer según el comando de voz recibido.
    function procesarComando(comando) {
        // Si el comando contiene "SALÚDANOS", reproduce el primer audio.
        if (comando.includes("SALÚDANOS")) {
            playMusic('amy_1');
        
        // Si contiene "PLATÍCANOS", reproduce el segundo.
        } else if (comando.includes("PLATÍCANOS") || comando.includes("PLATICANOS")) {
            playMusic('amy_2');
        
        // Si contiene "CONTINÚA", reproduce el tercero.
        } else if (comando.includes("CONTINÚA") || comando.includes("CONTINUA")) {
            playMusic('amy_3');
        
        // Si no entiende el comando, responde con voz.
        } else {
            const dialogo = "No entendí ese comando. Por favor intenta con 'Salúdanos', 'Platícanos' o 'Continúa'.";
            responder(dialogo);
        }
    }

    // La función para responder con voz se mantiene para los casos de error.
    function responder(texto) {
        tvDialogo.textContent = texto;
        const utterance = new SpeechSynthesisUtterance(texto); // Crea un objeto de "habla".
        utterance.lang = 'es-MX'; // Le asignamos el idioma y la voz.
        textToSpeech.cancel(); // Detiene cualquier cosa que esté diciendo antes.
        textToSpeech.speak(utterance); // Dice el nuevo texto.
    }
});