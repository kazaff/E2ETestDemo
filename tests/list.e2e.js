describe('列表页面', function() {
	before(function() {
    casper.start('http://localhost/E2ETestDemo/pages/list/list.html?page=1');
		casper.viewport(1024, 768);
		// 重要：必须找到机制能够确保被测页面一切就绪（js加载执行），
		// 这里是采用监控页面js全局变量是否赋值
		// 若被测页面没有类似行为，你只能考虑预设一个时间差，使用casper.wait()接口
		casper.waitFor(function check(){
			return this.evaluate(function(){
				return timeZone === 'EST5EDT';
			});
		});
  });

	it('页面标题', function(){
		casper.then(function(){
			'List Demo'.should.matchTitle;
			expect('.box-title').to.have.text('List');
		});
	});

	it('日期输入框默认值', function(){
		casper.then(function(){
			//注意，这里被测页面逻辑默认显示的是当日日期，类似这种依赖运行上下文（访问时间，访问者）的测试项，复用性会打折扣
			(function(){
				// 注意，这里是因为被测页面本身就加载了moment对象，否则我们需要配置casper来让目标页面引入依赖文件
				return document.querySelector('#startDate').value === moment().format('YYYY-MM-DD');
			}).should.evaluate.to.true;

			(function(){
				return document.querySelector('#endDate').value === moment().format('YYYY-MM-DD');
			}).should.evaluate.to.true;

			var position = this.getElementBounds('#_my97DP');
			expect(position.top).to.equal(-1970);
			expect(position.left).to.equal(-1970);
		});
	});

	it('日期输入框的日历相关操作', function(){
		casper.then(function(){	// 测试日历是否能正常显示和消失
			this.click('#startDate');
			expect('#_my97DP').to.be.visible;

			//this.clickLabel('List', 'h3');	// 这么写依赖页面的dom，不利于复用
			this.mouse.click(1,1);	// 而这么写，更好一些
			expect('#_my97DP').to.not.be.visible;
		});

		casper.then(function(){ // 测试日历相关操作
			this.click('#startDate');
			expect('#_my97DP').to.be.visible;
			// 老版本方法（casperjs < 1.0），没有在文档中提及哟~
			// this.page.switchToChildFrame(0);
			// this.click('#dpClearInput');
			// this.page.switchToParentFrame();

			// casperjs新版本推荐方法
			this.withFrame(0, function(){
				this.click('#dpClearInput');
			});

			this.then(function(){	// 注意，这里必须使用then，否则由于执行顺序会导致测试项失败
				expect('#startDate').to.have.fieldValue('');
				expect('#_my97DP').to.not.be.visible;

				this.click('#startDate');
				expect('#_my97DP').to.be.visible;
				this.withFrame(0, function(){
					this.click('#dpOkInput');
				});
				this.then(function(){	// 注意，这里必须使用then，否则由于执行顺序会导致测试项失败
					expect('#_my97DP').to.not.be.visible;
				});
			});
		});

	});

	it('列表项目的相关操作', function(){
		// 注意，这里测试项会非常依赖测试数据，所以最好能保证测试用例跑在可控的测试数据上，否则测试用例可能要非常复杂
		// 在该演示中，我们假设测试数据已知
		casper.then(function(){
			casper.waitForSelector('#dataBody tr');
		});

		casper.then(function(){	// status===solved时显示solve按钮
			var index = 1;
			this.each(this.getElementsInfo('#dataBody tr'), function(self, dom){
				var status = self.fetchText('#dataBody tr:nth-child('+ index +') span.logbookStatus');
				if(status === 'solved'){
					('#dataBody tr:nth-child('+ index +') a.logbookSolve').should.be.not.inDOM;
				}else if(status === 'unsolved'){
					('#dataBody tr:nth-child('+ index +') a.logbookSolve').should.be.inDOM;
				}
				index++;
			});
		});

		casper.then(function(){	// 点击solve按钮时弹窗
			this.click('#dataBody a.logbookSolve[data-id="66"]');	// 注意，这里的选择器写法意味着和测试数据产生依赖

			'.layui-layer-shade'.should.be.inDOM;
			'.layui-layer'.should.be.inDOM;

			expect('.layui-layer .layui-layer-title').to.have.text('Hint');
			expect('.layui-layer .layui-layer-content').to.have.text('Are you sure you want to solve it?');

			'.layui-layer .layui-layer-btn0'.should.have.tagName('a');
			expect('.layui-layer .layui-layer-btn0').to.have.text('confirm');
			'.layui-layer .layui-layer-btn1'.should.have.tagName('a');
			expect('.layui-layer .layui-layer-btn1').to.have.text('cancel');
		});

		casper.then(function(){	// 确认窗口的拖动
			this.mouse.down('.layui-layer-title');
			'#layui-layer-moves'.should.be.inDOM;

			this.mouse.move(100, 100);
			this.mouse.up(0, 0);
			'#layui-layer-moves'.should.be.not.inDOM;

			// todo 由于当前场景的问题，无法移动窗口，且坐标毫无规则，每次up调用时都会丢失移动
			// 但mouse方法应该是生效了，这一点可以通过注释up调用后看截屏，明显可以看到移动生效了
			// 同时我也尝试纯js方式来模拟拖动（https://ghostinspector.com/blog/simulate-drag-and-drop-javascript-casperjs/），依然无效
			// var newPosition = this.getElementBounds('.layui-layer');
			// expect(newPosition.left).to.equal(0);
			// expect(newPosition.top).to.equal(0);
		});

		casper.then(function(){	// 确认窗口的操作按钮
			this.click('.layui-layer .layui-layer-btn1');
			'.layui-layer-shade'.should.be.not.inDOM;
			'.layui-layer'.should.be.not.inDOM;

			this.click('#dataBody a.logbookSolve[data-id="66"]');
			this.click('.layui-layer .layui-layer-btn0');
			'.layui-layer-shade'.should.be.not.inDOM;
			'.layui-layer'.should.be.not.inDOM;

			this.wait(1000, function(){
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-content').to.have.text('solved');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;
				});

				'#dataBody a.logbookSolve[data-id="66"]'.should.be.not.inDOM;
			});
		});
	});

	it('翻页相关', function(){
		casper.then(function(){	// 下一页
			expect(/page=1/).to.matchCurrentUrl;
			this.click('#nextpage');
			expect(/page=2/).to.matchCurrentUrl;
			this.click('#nextpage');
			expect(/page=2/).to.matchCurrentUrl;
			'.layui-layer'.should.be.inDOM;
			expect('.layui-layer .layui-layer-content').to.have.text('last page');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		})

		casper.then(function(){	// 上一页
			this.click('#prepage');
			expect(/page=1/).to.matchCurrentUrl;
			this.click('#prepage');
			expect(/page=1/).to.matchCurrentUrl;
			'.layui-layer'.should.be.inDOM;
			expect('.layui-layer .layui-layer-content').to.have.text('first page');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// 页码跳转
			this.click('#jump_btn');
			'.layui-layer'.should.be.inDOM;
			expect('.layui-layer .layui-layer-content').to.have.text('error page');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;

				this.sendKeys('#currentInput', '0', {reset: true});
				this.click('#jump_btn');
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-content').to.have.text('error page');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;

					this.sendKeys('#currentInput', '3', {reset: true});
					this.click('#jump_btn');
					'.layui-layer'.should.be.inDOM;
					expect('.layui-layer .layui-layer-content').to.have.text('error page');
					this.wait(3000, function(){
						'.layui-layer'.should.be.not.inDOM;

						this.sendKeys('#currentInput', 'kazaff', {reset: true});
						expect('#currentInput').to.have.fieldValue('');
					});
				});
			});
		})
	});

	//=========用来辅助写测试用例，可以实时反馈页面的状态=========
	// it('Test截屏', function(){
	// 	casper.then(function(){
	// 		this.wait(2000, function() {
	// 			this.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36');
	// 			this.capture('test.png');
	// 		});
	// 	});
	// });
});
