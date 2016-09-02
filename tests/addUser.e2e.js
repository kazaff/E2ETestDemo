describe('新增用户页面', function() {
  before(function() {
    casper.start('http://localhost/E2ETestDemo/pages/addUser/addUser.html');
		casper.viewport(1024, 768);
		// 重要：必须找到机制能够确保被测页面一切就绪（js加载执行），
		// 这里使用的是监督目标DOM是否消失，这个DOM是由被测页面中js动态创建的，一旦它消失，证明页面一切就绪。
		// 若被测页面没有类似行为，你只能考虑预设一个时间差，使用casper.wait()接口
		casper.waitWhileVisible('.a-upload', function(){}, function(){
			expect('.a-upload').to.not.be.visible;
		}, 3000);
  });

	it('表单初始化检查', function(){
		casper.then(function(){	// 直接点击save按钮应该会报错
			'.layui-layer'.should.be.not.inDOM;
			expect('#selectDepartment').to.not.be.visible;


			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('emptyAccount');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// account留空会报错
			this.click('#user_account');
			this.mouse.click(1, 1);
			expect('.layui-layer .layui-layer-content').to.have.text('notEmpty');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// 默认头像
			expect(casper.getElementAttribute('#user_face_img', 'src')).to.equal('../../assets/css/images/defaultHead.png');
		});
	});

	it('表单验证', function(){
		casper.then(function(){	// 只填写account提交表单应该报错
			this.sendKeys('#user_account', 'kazaff', {reset: true});

			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('emptyUserLastName');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// 只填写account和lastname提交表单应该报错
			this.sendKeys('#last_name', 'sen', {reset: true});

			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('emptyUserFirstName');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// 只填写account和firstname,lastname提交表单应该报错
			this.sendKeys('#first_name', 'lin', {reset: true});

			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('emptyPosition');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// 只填写account,firstname,lastname,position提交表单应该报错
			this.sendKeys('#user_position', 'coder', {reset: true});

			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('hotel empty');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){	// phone和mail格式
			this.sendKeys('#user_phone', 'abc', {reset: true});
			expect('#user_phone').to.have.fieldValue('');

			this.sendKeys('#user_mail', 'abc', {reset: true});
			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('wrongEmail');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});

		casper.then(function(){
			this.sendKeys('#user_mail', '', {reset: true});
			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('hotel empty');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;
			});
		});
	});

	it('hotel输入验证', function(){
		casper.then(function(){	// 初始化表单其他input，排出干扰
			this.sendKeys('#user_account', 'kazaff', {reset: true});
			this.sendKeys('#first_name', 'lin', {reset: true});
			this.sendKeys('#last_name', 'sen', {reset: true});
			this.sendKeys('#user_position', 'coder', {reset: true});
		});

		casper.then(function(){	// 选择'zhonggongsi'选项将导致'add hotel'按钮disabled
			expect(this.getHTML('#selectHotel')).to.equal('\n\t\t\t\t\t\t\t\t\t\t\t\t\t\t');
			'span.select2-dropdown'.should.be.not.inDOM;

			this.click('#addHotel');
			this.wait(10, function(){	// 注意，这里必须等待js执行，否则casper会测试不到js控件效果
				this.click('#selectHotel div.form-group:nth-child(1) span.select2-selection');

				'span.select2-dropdown'.should.be.inDOM;
				this.mouse.click('ul.select2-results__options', 5, 5);	// 注意，这里使用this.click无法生效，只能使用mouse.click，原因不详

				expect(casper.getElementAttribute('#addHotel', 'disabled')).to.equal('disabled');
				expect('#selectDepartment').to.not.be.visible;

				this.click('#btn_basic_userCreate_save');
				expect('.layui-layer .layui-layer-content').to.have.text('zonggongsi empty code');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;

					// 点击删除酒店按钮后，对应dom消失，且addhotel按钮恢复可点击状态
					this.click('#selectHotel button.delateHotel:nth-child(1)');
					'#selectHotel button.delateHotel'.should.be.not.inDOM;
					expect(casper.getElementAttribute('#addHotel', 'disabled')).to.equal('');
				});
			});
		});

		casper.then(function(){	// 测试非zonggongsi下的department和machine_id相关操作
			this.click('#addHotel');
			this.click('#btn_basic_userCreate_save');
			expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights empty code');
			this.wait(3000, function(){
				'.layui-layer'.should.be.not.inDOM;

				this.sendKeys('input[placeholder="conmon_codeId"]', 'kazaff', {reset: true});
				this.click('#btn_basic_userCreate_save');
				expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights empty basic sectors');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;

					// machine_ID最大长度测试
					this.sendKeys('input[placeholder="conmon_codeId"]', '012345678910', {reset: true});
					expect('input[placeholder="conmon_codeId"]').to.have.fieldValue('0123456789');

					this.mouse.click('input.mycheckbox', 1, 1);
					expect(casper.getElementAttribute('input[placeholder="conmon_codeId"]', 'disabled')).to.equal('disabled');

					this.click('#btn_basic_userCreate_save');
					expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights empty basic sectors');
					this.wait(3000, function(){
						'.layui-layer'.should.be.not.inDOM;

						this.click('#addDepartment');
						this.sendKeys('input[placeholder="hourly"]', 'abc', {reset: true});
						expect('input[placeholder="hourly"]').to.have.fieldValue('');
						this.sendKeys('input[placeholder="hourly"]', '1234567', {reset: true});
						expect('input[placeholder="hourly"]').to.have.fieldValue('');
						this.sendKeys('input[placeholder="hourly"]', '123456.123', {reset: true});
						expect('input[placeholder="hourly"]').to.have.fieldValue('123456.12');
						this.click('#btn_basic_userCreate_save');
						expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights empty basic sectors');
						this.wait(3000, function(){
							'.layui-layer'.should.be.not.inDOM;

							this.mouse.click('input.myRadio', 1, 1);
							this.click('#btn_basic_userCreate_save');
							this.wait(4000, function(){
								'.layui-layer'.should.be.not.inDOM;

								expect(casper.getElementAttribute('#btn_basic_userCreate_save', 'disabled')).to.equal('disabled');
								expect('#btn_basic_userCreate_uploadFace').to.be.visible;

								//测试头像上传
								this.fill('form#face_form', {
									'face': './face.jpg'
								}, false);
								expect(casper.getElementAttribute('#user_face_img', 'src')).to.equal('http://localhost/E2ETestDemo/assets/dist/img/user2-160x160.jpg');
							});
						});
					});
				});
			});		// 注意，这里回调地狱问题很严重
		});
	});

	it('hotel和department重复验证', function(){
		casper.reload(function() {	// 注意，这里需要刷新页面
			casper.then(function(){	// 初始化表单其他input，排出干扰
				this.sendKeys('#user_account', 'kazaff', {reset: true});
				this.sendKeys('#first_name', 'lin', {reset: true});
				this.sendKeys('#last_name', 'sen', {reset: true});
				this.sendKeys('#user_position', 'coder', {reset: true});
			});

			casper.then(function(){
				this.click('#addHotel');
				this.click('#addHotel');
				this.click('#btn_basic_userCreate_save');
				'.layui-layer'.should.be.inDOM;
				expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights choose not be repeated');
				this.wait(3000, function(){
					'.layui-layer'.should.be.not.inDOM;
				});
			});
    });

		casper.reload(function() {	// 注意，这里需要刷新页面
			casper.then(function(){	// 初始化表单其他input，排出干扰
				this.sendKeys('#user_account', 'kazaff', {reset: true});
				this.sendKeys('#first_name', 'lin', {reset: true});
				this.sendKeys('#last_name', 'sen', {reset: true});
				this.sendKeys('#user_position', 'coder', {reset: true});
			});

			casper.then(function(){
				this.click('#addHotel');
				this.mouse.click('input.mycheckbox', 1, 1);

				// 注意，这里必须使用thenClick，连续使用两次click的话无法满足需求
				// 这里算是被测页面的一个bug，因为下拉菜单的数据是ajax获取来的，若两次click点击频率短到ajax响应时间，则ajax的回调函数中操作dom的方法写的有问题
				// 改用thenClick，可以规避这个设计问题，但更好的方法是对被测页面进行修改
				this.thenClick('#addDepartment', function(){
					this.mouse.click('input.myRadio', 1, 1);
					this.thenClick('#addDepartment', function(){	// 推荐，在任何情况下都首选使用thenClick，而非click
						this.click('#btn_basic_userCreate_save');
						'.layui-layer'.should.be.inDOM;
						expect('.layui-layer .layui-layer-content').to.have.text('Hilton Hasbrouck Heights--MOD Scheduler choose not be repeated');
						this.wait(3000, function(){
							'.layui-layer'.should.be.not.inDOM;
						});
					});
				});
			});
    });
	});

	//=========用来辅助写测试用例，可以实时反馈页面的状态=========
	it('Test截屏', function(){
		casper.then(function(){
			this.wait(1500, function() {
				this.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36');
				this.capture('test.png');
			});
		});
	});
});
