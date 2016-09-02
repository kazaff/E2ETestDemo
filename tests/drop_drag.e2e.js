describe('日历页面', function() {
  before(function() {
    casper.start('http://localhost/E2ETestDemo/pages/drop&drag/schedule.html');
		casper.viewport(1024, 768);
		// 重要：必须找到机制能够确保被测页面一切就绪（js加载执行），
		// 这里使用的是监督目标DOM是否存在，这个DOM是由被测页面中js动态创建的，一旦它存在，证明页面一切就绪。
		// 若被测页面没有类似行为，你只能考虑预设一个时间差，使用casper.wait()接口
		casper.waitForSelector('.fc-toolbar', function(){}, function(){
			'.fc-toolbar'.should.be.inDOM;;
		}, 3000);
  });

	it('日历初始化状态', function(){
		casper.then(function(){
			'.fc-prev-button'.should.be.inDOM;
			'.fc-next-button'.should.be.inDOM;
			'.fc-myCustomButton-button'.should.be.inDOM;
			expect('.fc-myCustomButton-button').to.have.text('save');

			this.thenClick('.fc-myCustomButton-button', function(){
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-content').to.have.text('noEvent');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;

					// 根据使用的fullcalendar插件，每时刻的高度是44px，希望默认以6am为界面初始时刻，则滚动条高度应该是44*6=264px
					var scrollTop = this.evaluate(function(){
						return document.querySelector('.fc-time-grid-container').scrollTop;
					});
					expect(scrollTop).to.equal(264);

					// 根据style的值来验证对应的区块位置是否正确
					// 注意，casper.getElementAttribute获取的值，顺序会和浏览器调试窗口显示的不同
					expect(casper.getElementAttribute('div.fc-content-skeleton td:nth-child(2) div.fc-bgevent', 'style')).to.equal('background-color: blue; top: 21px; bottom: -153px;');
					expect(casper.getElementAttribute('div.fc-content-skeleton td:nth-child(3) div.fc-bgevent', 'style')).to.equal('background-color: blue; top: 131px; bottom: -285px;');
					expect(casper.getElementAttribute('div.fc-content-skeleton td:nth-child(4) div.fc-bgevent', 'style')).to.equal('background-color: blue; top: 175px; bottom: -373px;');
				});
			});
		});
	});

	it('新增任务相关操作', function(){
		casper.then(function(){
			// 点击无效区域，无法触发任务弹窗
			this.click('div.fc-time-grid div.fc-slats tr[data-time="06:00:00"]', 50, 10);
			'.layui-layer'.should.be.not.inDOM;

			// 先滚动到目标位置，方便定位和截屏验证
			this.evaluate(function(){
				return document.querySelector('.fc-time-grid-container').scrollTop = 22;
			});

			// 新增窗口
			this.mouse.down('div.fc-time-grid div.fc-slats tr[data-time="00:30:00"]', 50, 10);
			this.mouse.move('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			this.mouse.up('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			'.layui-layer'.should.be.inDOM;
			'.layui-layer-shade'.should.be.inDOM;
			expect('.layui-layer .layui-layer-title').to.have.text('Tip');
			'.layui-layer .layui-layer-btn0'.should.have.tagName('a');
			expect('.layui-layer .layui-layer-btn0').to.have.text('confirm');
			'.layui-layer .layui-layer-btn1'.should.have.tagName('a');
			expect('.layui-layer .layui-layer-btn1').to.have.text('cancel');

			// 测试取消新增任务
			this.click('.layui-layer .layui-layer-btn1');
			'.layui-layer'.should.be.not.inDOM;
			'.layui-layer-shade'.should.be.not.inDOM;
			'div.fc-content-skeleton td:nth-child(2) div.fc-event-container a'.should.be.not.inDOM;
		});

		casper.then(function(){
			this.evaluate(function(){
				return document.querySelector('.fc-time-grid-container').scrollTop = 22;
			});
			// 新增窗口
			this.mouse.down('div.fc-time-grid div.fc-slats tr[data-time="00:30:00"]', 50, 10);
			this.mouse.move('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			this.mouse.up('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			this.wait(1000, function(){
				this.thenClick('.layui-layer .layui-layer-btn0', function(){
					'div.fc-content-skeleton td:nth-child(2) div.fc-event-container a'.should.be.inDOM;
					expect('div.fc-content-skeleton td:nth-child(2) div.fc-event-container a span.perDayTimeS').to.have.text('00:30');
					expect('div.fc-content-skeleton td:nth-child(2) div.fc-event-container a span.perDayTimeE').to.have.text('03:30');

					//删除任务
					this.thenClick('div.fc-content-skeleton td:nth-child(2) div.fc-event-container a img', function(){
						 	'div.fc-content-skeleton td:nth-child(2) div.fc-event-container a'.should.be.not.inDOM;
					});
				});
			});
		});
	});

	it('任务打印相关', function(){
		casper.then(function(){
			this.evaluate(function(){
				return document.querySelector('.fc-time-grid-container').scrollTop = 22;
			});

			// 新增窗口
			this.mouse.down('div.fc-time-grid div.fc-slats tr[data-time="00:30:00"]', 50, 10);
			this.mouse.move('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			this.mouse.up('div.fc-time-grid div.fc-slats tr[data-time="03:00:00"]', 50, 10);
			this.wait(1000, function(){
				this.thenClick('.layui-layer .layui-layer-btn0');
			});
		});

		casper.then(function(){
			this.thenClick('.fc-widget-header span.viewImg:nth-child(1)', function(){
				'.layui-layer-shade'.should.be.inDOM;
				'.layui-layer'.should.be.inDOM;
				expect('#todayDetailBody td:nth-child(2)').to.have.text('00:30~03:30');

				this.thenClick('a.layui-layer-close', function(){
					'.layui-layer-shade'.should.be.not.inDOM;
					'.layui-layer'.should.be.not.inDOM;
				});
			});
		});
	});

	// 注意，这里偷懒了，依赖 '任务打印相关' 测试用例
	it('保存相关', function(){
		casper.then(function(){
			this.thenClick('.fc-myCustomButton-button', function(){
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-title').to.have.text('Tip');
				expect('.layui-layer .layui-layer-content').to.have.text('Announce Or Not');

				//发布
				this.thenClick('.layui-layer-btn0', function(){
					expect('.layui-layer .layui-layer-content').to.have.text('Cannot Public');
				});
			});
		});

		casper.then(function(){
			this.thenClick('.fc-myCustomButton-button', function(){
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-title').to.have.text('Tip');
				expect('.layui-layer .layui-layer-content').to.have.text('Announce Or Not');

				//保存
				this.thenClick('.layui-layer-btn1', function(){
					expect('.layui-layer .layui-layer-content').to.have.text('Save Success');
				});
			});
		});
	});

	//=========用来辅助写测试用例，可以实时反馈页面的状态=========
	// it('Test截屏', function(){
	// 	casper.then(function(){
	// 		this.wait(1000, function() {
	// 			this.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36');
	// 			this.capture('test.png');
	// 		});
	// 	});
	// });
});
