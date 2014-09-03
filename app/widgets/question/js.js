module.exports = function($, elucia) {
		var 

		init = function(_node, _data) {
			this.node = _node;
			this.data = _data;
			var report = {},
				back_disable = true;

			$('div#question_1 > div.button', _node).hover(function() {
				$(this).addClass('hover');
			}, function() {
				$(this).removeClass('hover');
			});
			$('div#question_1', _node).show();
			$("[type=range]").change(function(){
				var val = $(this).val();
				$(this).next().text(val);
			});
			$('div#question_1 > div.button', _node).click(function(event) {			
				var subtitle = '';
				/* 評價好繼續回答第二題，評價差跳答第三題 */
				if ($(this).prop('id') == "good_button") {
					report.eval = true;
					$(this).parent().next().show();
					subtitle = $(this).parent().next().children('div.subtitle').text();
				}	
				else {
					report.eval = false;
					$(this).parent().next().next().show();
					subtitle = $(this).parent().next().next().children('div.subtitle').text();
				}
				/* 替換問題題目 */
				$('div.title', _node).text(subtitle);
				/* 隱藏目前問題 */
				$(this).parent().hide();
				/* 顯示切換題目按鈕 */
				$('div.footer', _node).show();
			});

			$('textarea', _node).focus(function() {
				if (this.value === this.defaultValue) this.value = '';
			}).blur(function() {
				if (this.value === '') this.value = this.defaultValue;
			});

			$('div.footer > div#back', _node).hover(function() {
				if (back_disable) $(this).css('cursor', 'default');
				else {
					$(this).css('cursor', 'pointer');
					$(this).css('color', '#fff');
				} 
			}, function() {
				if (!back_disable) $(this).css('color','#191919');
			});

			$('div.footer > div#back', _node).click(function() {
				if (!back_disable) {
					/* 隱藏目前問題 */
					var curr_issue = $('div.issue', _node).filter(function() {
						return $(this).is(":visible");
					}).hide();
					if (report.eval && curr_issue.prop('id')=="question_4") {
						/* 替換問題題目 */
						var subtitle = curr_issue.prev().prev().children('div.subtitle').text();
						$('div.title', _node).text(subtitle);
						/* 顯示第二道問題 */
						curr_issue.prev().prev().show();
						/* disable back button */
						back_disable = true;
						$(this).css('cursor', 'default').css('color', '#393939');
					}
					else {
						/* 若為最後一道題目，隱藏submit按鈕，顯示next按鈕 */
						if (curr_issue.prop('id')=="question_8") {
							$('div.footer > div#submit', _node).hide();
							$('div.footer > div#next', _node).css('color', '#191919').show();
						} 
						else if (curr_issue.prop('id')=="question_4") {
							/* disable back button */
							back_disable = true;
							$(this).css('cursor', 'default').css('color', '#393939');
						}
						/* 替換問題題目 */
						var subtitle = curr_issue.prev().children('div.subtitle').text();
						$('div.title', _node).text(subtitle);
						/* 顯示前一道問題 */
						curr_issue.prev().show();
					}
				}
			});

			$('div.footer > div#next', _node).hover(function() {
				$(this).css('color','#fff');
			}, function() {
				$(this).css('color','#191919');
			});

			$('div.footer > div#next', _node).click(function() {
				/* 隱藏目前問題 */
				var curr_issue = $('div.issue', _node).filter(function() {
					return $(this).is(":visible");
				}).hide();
				/* 若為第二道題目，跳答第四題 */
				if (curr_issue.prop('id')=="question_2") {
					/* 替換問題題目 */
					var subtitle = curr_issue.next().next().children('div.subtitle').text();
					$('div.title', _node).text(subtitle);
					/* 顯示第四道問題 */
					curr_issue.next().next().show();
				} else {
					/* 若為倒數第二道題目，隱藏next按鈕，顯示submit按鈕 */
					if (curr_issue.prop('id')=="question_7") {
						$('div#next', _node).hide();
						$('div#submit', _node).show();
					}
					/* 替換問題題目 */
					var subtitle = curr_issue.next().children('div.subtitle').text();
					$('div.title', _node).text(subtitle);
					/* 顯示下一道問題 */
					curr_issue.next().show();
				}
				if (back_disable) {
					back_disable = false;
					$('div#back', _node).css('color','#191919');
				}
			});

			$('div.footer > div#submit', _node).hover(function() {
				$(this).css('color','#fff');
			}, function() {
				$(this).css('color','#191919');
			});

			$('div.footer > div#submit', _node).click(function() {
				// report user feedback to center
				var checkbox = '';
				if (report.eval) {
					for(var i=0;i<$('div#question_2 [type=checkbox]:checked', _node).length;i++) {
						checkbox = checkbox.concat( $('div#question_2 [type=checkbox]:checked:eq('+i+')').next().text()+';' );
					}
				} else {
					for(var i=0;i<$('div#question_3 [type=checkbox]:checked', _node).length;i++) {
						checkbox = checkbox.concat( $('div#question_3 [type=checkbox]:checked:eq('+i+')').next().text()+';' );
					}
				}
				report.checkbox = checkbox;
				for(var i=3;i<$('div.issue', _node).length;i++) {
					var score = $('div.issue:eq('+i+')', _node).find("[type=range]").val(),
						comment = $('div.issue:eq('+i+')', _node).find('textarea').val();
					switch(i) {
						case 3:
							report.ui = {
								score: score,
								comment: comment
							};
							break;
						case 4:
							report.operate = {
								score: score,
								comment: comment
							};
							break;
						case 5:
							report.security = {
								score: score,
								comment: comment
							};
							break;
						case 6:
							report.backup = {
								score: score,
								comment: comment
							};
							break;
						default:
							report.comment = comment;	
					}
				} // end of for
				postClientFeedback(report, function(res) {
					if (res.result == 1) {
						elucia.confirm("感謝您提供給 iServStorage 團隊寶貴的意見！", {
							ok: function() {
								$('div.header > div.controll > div.close').click();
							},
							cancel: function() {
								$('div.header > div.controll > div.close').click();
							}
						});
					}
				});
			});
			
			return this;
		},

		destroy = function() {

		},

		postClientFeedback = function(_data, _callback) {
			var request = {
				path: 'report/clientInfo',
				data: {report: _data},
				success: function(response) {
					_callback && _callback(response);
				}
			};
			elucia.centerRest.post(request);
		},

		that = {
			init: init,
			destroy: destroy
		};

		return that;
};