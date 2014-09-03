module.exports = function($, elucia) {
    var

	init = function(_node, _data) {
		var deg = 0;

        $('div.rule', _node).text(_data.name);
        $('div.rule', _node).hover(function() {
            $(this).parent().children('div#icon').show();
            $(this).css('color','#fff').css('text-shadow','1px 1px 2px #000');
        }, function() {
            $(this).parent().children('div#icon').hide();
            $(this).css('color','#000').css('text-shadow','0px 0px');
        });

        $("div.rule", _node).click(function(event) {
            deg = ( deg == 0 ) ? 180 : 0;
            $(this).parent().children('div#icon').css("-webkit-transform","rotate("+deg+"deg)");
            var method = $(this).text();
            updateData( method, deg );
        });

		  return this;
	},

	updateData = function( _method, _deg ) {
		var fileArray = []; //JavaScript Array Object才可以使用sort方法
        var folderArray = []; //資料夾依照名稱排序，因此另建一個陣列存放資料夾名稱
        var divFile = "div.backupState div.content div#fileList";
        var fileIndex = 0;
        var folderIndex = 0;

        _method = _method.toLowerCase();
        if( _method == "name" ) {
            // 抓出div.content中所有div.file的檔案名稱，存入data陣列中
            for(var i = 0;i < $(divFile).length;i++) {
                var fileId = parseInt( $(divFile + " div#list_id:eq("+i+")").text() ),
                    fileName = $(divFile + " div.name:eq("+i+")").text(),
                    fileType = $(divFile + " div.type:eq("+i+")").text();
                
                if( fileType == "folder" ) {
                    folderArray[fileIndex++] = fileName; 
                }
                else {
                    fileArray[folderIndex++] = {
                        id: fileId,
                        name: fileName 
                    };
                }
            }
            fileArray.sort(function(a,b) {return a.name > b.name}); // 依據檔名字母順序由A至Z排序
            folderArray.sort(); // 依據資料夾名稱字母順序由A至Z排序
            if(_deg==0) { // 箭頭向下，遞減排序
                fileArray.reverse(); // 檔名由Z至A排序
                folderArray.reverse(); // 資料夾名稱由Z至A排序
                // 先排檔案，再排資料夾
                // 按照排序好的fileArray陣列，找出內容含有相同檔名的div.file重新加入div.content
                arraySort( fileArray, _method, 'file' ); 
                arraySort( folderArray, _method, 'folder' );
            }
            else {
                // 名稱遞增排序，先排資料夾，再排檔案
                arraySort( folderArray, _method, 'folder' );
                // 按照排序好的fileArray陣列，找出內容含有相同檔名的div.file重新加入div.content
                arraySort( fileArray, _method, 'file' );
            }  
        }
        else if( _method == "state" ) {
            for(var i = 0;i < $(divFile).length;i++) {
                var fileId = parseInt( $(divFile + " div#list_id:eq("+i+")").text() ),
                    fileType = $(divFile + " div.type:eq("+i+")").text(),
                    fileState = parseInt( $(divFile + " div.state:eq("+i+")").text() );

                if( fileType == "folder" ) {
                    folderArray[fileIndex++] = {
                        id: fileId,
                        state: fileState
                    }; 
                }
                else {
                    fileArray[folderIndex++] = {
                        id: fileId,
                        state: fileState 
                    };
                }
            }
          
            fileArray.sort(function(a,b) {return a.state-b.state});
            folderArray.sort(function(a,b) {return a.state-b.state});
            if(_deg==0) {
                fileArray.reverse();
                folderArray.reverse();
                arraySort( folderArray, _method, 'folder' );
                arraySort( fileArray, _method, 'file' );
            }
            else {
                arraySort( fileArray, _method, 'file' );
                arraySort( folderArray, _method, 'folder' );
            }  
        }
        else if( _method = "size") {
            for(var i = 0;i < $(divFile).length;i++) {
                // 將資料夾名稱存入dataArray陣列，將檔案大小存入data陣列
                if( $(divFile + " div.type:eq("+i+")").text() == "folder" ) {
                    folderArray[fileIndex++] = $(divFile + " div.name:eq("+i+")").text();
                }
                else {
                    fileArray[folderIndex++] = {
                        id: parseInt($(divFile + " div#list_id:eq("+i+")").text()),
                        size: $(divFile + " div.size:eq("+i+")").text()   
                    };
                }
            }
            fileArray.sort(function(a,b){return a.size-b.size}); // 將檔案大小由小至大排序
            folderArray.sort(); // 將資料夾依照名稱排序
            
            if(_deg==0) { // 若箭頭朝下，則依照檔案大小遞減排序
                fileArray.reverse(); // 將檔案大小由大至小排序
                // 先插入檔案，再插入資料夾
                arraySort( fileArray, _method, 'file' );
                arraySort( folderArray, 'name', 'folder' );
            }
            else {
                // 先插入資料夾，再插入檔案
                arraySort( folderArray, 'name', 'folder' );
                arraySort( fileArray, _method, 'file' );
            }   
        }
        elucia.debug("### backupState.sortArray ###");
	},

    arraySort = function( _array, _rule, _type ) {
        // 參數 _array 為排序好的陣列
        // 參數 _rule 為排序規則，例如名稱或檔案大小
        // 參數 _type 為檔案型態，因為資料夾與檔案分別排序
        if( typeof _array === 'undefined' || _array == null )
            return;

        var divContent = "div.backupState div.content",
            divFile = divContent.concat(" div#fileList");

        if( _type == 'folder' ) {
            $.each( _array, function( index, value ) {
                if (_rule == "name") {
                    $(divFile).filter(function() {
                        return $(this).children('div.name').text() === value &&
                        $(this).children('div.type').text() == _type; 
                    }).appendTo(divContent);
                }
                else {
                    $(divFile).filter(function() {
                        return $(this).children('div.' + _rule).text() === value &&
                        $(this).children('div.type').text() == _type; 
                    }).appendTo(divContent);
                }
            });
        }
        else {
            $.each( _array, function( index, value ) {
                $(divFile).filter(function() {
                    return parseInt($(this).children('div#list_id').text()) === value.id;
                }).appendTo(divContent);
            });
        }
    },

	destroy = function() {
		  elucia.debug("### appliaction.destroy ###");
	},

	that = {
		init: init,
		updateData: updateData,
		destroy: destroy
	};

	return that;
};