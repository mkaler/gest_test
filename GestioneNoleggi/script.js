$(document).ready(function(){
    /*
    *event per visualizzare le auto disponibili
    */
    $('#auto_disponibili').click(function()
    {
        $.ajax({
            type: "GET",
            url: "elaborate.php",
            cache: false,
            data:{
                operation : "auto_disp",
                payload : "none"
            },
            success: function(result){
               try
               {
                    var table = get_bootstable_from_obj_array(JSON.parse(result), 'nessuna macchina disponibile');
               }
               catch(err)
               {
                   table = '<div class="alert alert-danger">'+'Messaggio di Error da backend:'+result+'</div>';
                   $("#dynamic_div").html(table);
               }
                $("#dynamic_div").html(table);
            },
            error: function()
            {
                alert('error');
            }
        });
    });
    $('#auto_disponibili').trigger('click');
    /**
     * evento per visualizzare la lista di noleggi
     */
    $('#lista_noleggi').click(function()
    {
        $.ajax({
            type: "GET",
            url: "elaborate.php",
            data:{
                operation : "lista_noleggi",
                payload : "none"
            },
            cache: false,
            success: function(result){
                try
                {
                    var table = get_bootstable_from_obj_array(JSON.parse(result), 'Nessuna macchina è attualmente noleggiata');
                }
                catch(err)
                {
                    table = '<div class="alert alert-danger">'+'Messaggio di Error da backend:'+result+'</div>';
                    $("#dynamic_div").html(table);
                }
                $("#dynamic_div").html(table);
            },
            error: function()
            {
                alert('error');
            }
        });
    });
    /*
     *evento per aggiungere le opzioni select nella form "noleggio_form"
     */
    $('#fill_noleggio_form').click(function get_select_options_fromdb(){
        $.ajax({
            type: "GET",
            url: "elaborate.php",
            cache:false,
            data:{
                operation : "get_socio_auto",
                payload : "none"
            },
            success: function add_select_options_noleggio(response)
            {
                try
                {
                    var result = JSON.parse(response);
                    var soci_array = result[0];
                    var targa_array = result[1];
                    $('#select_cf').empty();
                    $('#select_targa').empty()
                    $('#select_cf').append('<option value="" selected disabled>selezionare il codice fiscale</option>');
                    $('#select_targa').append('<option value="" selected disabled>selezionare la targa</option>');
                    soci_array.forEach(function(attr)
                    {
                        $('#select_cf').append('<option value="'+attr.cf+'">'+attr.nome+' '+attr.cognome+'</option>');
                    });
                    targa_array.forEach(function(attr)
                    {
                        $('#select_targa').append('<option value="'+attr+'">'+attr+'</option>');
                    });
                }
                catch(err)
                {
                    table = '<div class="alert alert-danger">'+'Messaggio di Error da backend:'+response+'</div>';
                    $("#noleggio_form").html(table);
                }
            },
            error: function()
            {
                alert('error');
            }
        });
    });
    /*
     *evento per aggiungere le opzioni select nella form "restituisci_form"
     */
    $('#fill_restituisci_form').click(function fill_restituisci_form(){
        $.ajax({
            type: "GET",
            url: "elaborate.php",
            cache : false,
            data:{
                operation : "get_restituisci_info",
                payload : "none"
            },
            success: function(result){
                try
                {
                    var result_array = JSON.parse(result);
                    $('#select_targa_rest').empty();
                    $('#select_targa_rest').append('<option value="" selected disabled>selezionare la targa</option>');
                    result_array.forEach(element =>{
                        $('#select_targa_rest').append('<option value="'+element.targa+'">'+element.targa+'</option>');
                    });
                }
                catch(err)
                {
                    table = '<div class="alert alert-danger">'+'Messaggio di Error da backend:'+result+'</div>';
                    $("#restituisci_form").html(table);
                }
            }
        });
    });
    /*
     *eventi per impostare max e min data"
     */
    $('#inizio').change(function(){
        var min_date = $('#inizio').val();
        $('#fine').attr({"min": min_date});
    });
    $('#fine').change(function(){
        var max_date = $('#fine').val();
        $('#inizio').attr({"max": max_date});
    });  

});
/**
 * stampa dinamica di un array degli array associativi, in forma di una tabella
 */
function get_bootstable_from_obj_array(json_array, message)
{
    var table = "";
    if(json_array.length == 0)
        var table = '<div class="alert alert-danger">'+message+'</div>';
    else
    {
        var table = '<table class = "table"> <thead> <tr>';
        var sample_obj = json_array[0];
        for(var attr in sample_obj)
        {
            table += '<th>'+ attr +'</th>';
        }
        table += '</tr></thead><tbody>'
        json_array.forEach(function(element)
        {
            table += '<tr>';
            for (var attr in element)
            {
                table += '<td>'+element[attr]+'</td>'
            }
            table += '</tr>';
        });
        table += '</tbody></table>';
    }
    return table;
}

/**
 * funzione da eseguire quando viene inviato la form "noleggio_form"
*/
function submit_noleggio(form)
{
    form_array_raw = $(form).serializeArray();
    form_array = {};
    form_array_raw.forEach(element => {
        form_array[element.name] = element.value;
    });
    $.ajax({
        type: "POST",
        url: "elaborate.php",
        cache:false,
        data:{
            operation : "effettua_noleggio",
            payload : form_array
        },
        success: function(result)
        {
            $('#reset_noleggio').trigger('click');
            $('#fill_noleggio_form').trigger('click');
            alert(result);
        }
    });
    return false;
}
/**
 * funzione da eseguire quando viene inviato la form "restituisci_form"
*/
function restituisci_submit(form)
{
    form_array_raw = $(form).serializeArray();
    form_array = {};
    form_array_raw.forEach(element => {
        form_array[element.name] = element.value;
    });
    $.ajax({
        type: "POST",
        url: "elaborate.php",
        cache:false,
        data:{
            operation : "restituisci_auto",
            payload : form_array
        },
        success: function(result)
        {
            $("#fill_restituisci_form").trigger("click");
            alert(result);
        }
    });
    return false;
}

