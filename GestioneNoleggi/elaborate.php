<?php
    if(sizeof($_GET) > 0)
        $operation = $_GET['operation'];
    else
        $operation= $_POST['operation'];

    $conn = connect_db();
    switch($operation)
    {
        case 'auto_disp':
        {
            echo json_encode(get_auto_disponibili($conn));
            break;
        }
        case 'lista_noleggi':
        {
            echo json_encode(get_noleggi($conn));
            break;
        }
        case 'get_socio_auto':
        {
            echo json_encode(get_soci_auto($conn));
            break;
        }
        case 'effettua_noleggio':
        {
            $payload = $_POST['payload'];
            echo registra_noleggio($payload, $conn);
            break;
        }
        case 'get_restituisci_info':
        {
            echo json_encode(get_restituisci_info($conn));
            break;
        }
        case 'restituisci_auto':
        {
            echo restituisci_auto($conn,$_POST['payload']['targa']);
            break;
        }
    }

    function connect_db($server = 'localhost', $user = 'root', $password = 'mkaler1997', $db = 'test')
    {
        $conn = new mysqli($server, $user, $password, $db);
        if($conn->connect_error)
        {
            die(mysqli_connect_error());
        }
        return $conn;
    }
    /**
     * restituisce l'array delle auto disponibili
     */
    function get_auto_disponibili($conn)
    {
        $query = get_auto_disponibili_query();
        $result = $conn->query($query);
        $array_auto = array();
        if ($result->num_rows > 0)
        {
            while($row = $result->fetch_assoc()) 
            {
                $array_auto[] = $row;   
            }
        }
        return $array_auto;
    }
    function get_auto_disponibili_query()
    {
        $query = '
                SELECT
                    a.*
                FROM
                    auto a
                    WHERE
                        targa NOT IN
                        (
                            SELECT
                                targa
                            FROM
                                noleggi
                            WHERE
                                restituita = "N"
                        )
                ORDER BY
                    targa;
                ';
        return $query;
    }
    /**
     * restituisce l'array delle macchine che non sono state restituite
     */
    function get_noleggi($conn)
    {
        $query = 'SELECT
                    inizio,
                    fine,
                    restituita,
                    a.targa,
                    marca,
                    modello,
                    costo_giornaliero,
                    nome,
                    cognome,
                    s.cf
                FROM
                    noleggi n
                    JOIN auto a
                    JOIN soci s ON s.cf = n.cf
                    AND n.targa = a.targa
                    WHERE restituita = "N"
                    ORDER BY inizio DESC;';
        $result = $conn->query($query);
        $array_noleggi = array();
        if ($result->num_rows > 0)
        {
            while($row = $result->fetch_assoc()) 
            {
                $array_noleggi[] = $row;   
            }
        }
        return $array_noleggi;
    }
    /**
     * restituisce un'array che contiene 2 altri array
     * array[0] cf dei soci
     * array[0] targhe delle macchine disponibili
     */
    function get_soci_auto($conn)
    {
        $get_socio_query = 'SELECT cf,nome,cognome FROM soci';
        $array_auto = get_auto_disponibili($conn);
        $result_soci = $conn->query($get_socio_query);
        $array_soci = array();
        $array_targa = array();
        if ($result_soci->num_rows > 0)
        {
            while($row = $result_soci->fetch_assoc()) 
            {
                $array_soci[] = $row;   
            }
        }
        foreach ($array_auto as &$auto)
        {
            $array_targa[] = $auto['targa'];
        }
        $toret = array();
        $toret[0] = $array_soci;
        $toret[1] = $array_targa;
        return $toret;
    }
    /**
     * restituisce l'array di targhe delle macchine che non sono state restituite
     */
    function get_restituisci_info($conn)
    {

        $query = 'SELECT targa FROM noleggi WHERE restituita = "N";';
        $result = $conn->query($query);
        $array_toret = array();
        if ($result->num_rows > 0)
        {
            while($row = $result->fetch_assoc()) 
            {
                $array_toret[] = $row;   
            }
        }
        return $array_toret;
    }
    /**
     * salva un nuovo noleggio
     */
    function registra_noleggio($payload, $conn)
    {
        $restituita = 'N';
        $targa = $payload['targa'];
        $cf = $payload['cf'];
        $inizio = $payload['inizio'];
        $fine = $payload['fine'];
        $stmt = $conn->prepare('INSERT INTO noleggi(targa,cf, inizio, fine, restituita) VALUES (?,?,?,?,?)');
        if(!$stmt)
            echo $conn->error;
        $stmt->bind_param("sssss", $targa, $cf, $inizio, $fine, $restituita);
        $stmt->execute();
        echo 'noleggio è stato inserito';
    }
    function restituisci_auto($conn, $targa)
    {
        $stmt = $conn->prepare('UPDATE noleggi SET restituita = "S" WHERE targa = ?');
        if(!$stmt)
            echo $conn->error;
        $stmt->bind_param("s", $targa);
        $stmt->execute();
        echo 'l auto è stata restituita';
    }
?>