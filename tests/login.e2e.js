describe('登录页面', function() {
  before(function() {
    casper.start('http://localhost/E2ETestDemo/pages/login/login.html');
		// 重要：必须找到机制能够确保被测页面一切就绪（js加载执行），
		// 这里使用的是监督目标DOM是否出现，这个DOM是由被测页面中js动态创建的，一旦它出现，证明页面一切就绪。
		// 若被测页面没有类似行为，你只能考虑预设一个时间差，使用casper.wait()接口
		casper.waitForSelector('.form-control-feedback');
  });

	it('页面和表单标题', function(){
		casper.then(function(){
			'login demo'.should.matchTitle;
			expect('.login-box-msg').to.have.text('welcome to kazaff demo');
		});
	});

	it('表单初始化时的按钮状态', function(){
		casper.then(function(){
			'#btn_login_cancel'.should.have.tagName('button');
			expect(casper.getElementAttribute('#btn_login_cancel', 'type')).to.equal('reset');

			'#btn_login_sign'.should.have.tagName('button');
			expect(casper.getElementAttribute('#btn_login_sign', 'type')).to.equal('submit');
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});
	});

	it('表单初始化时输入框内容', function(){
		casper.then(function(){
			'input[name="account"]'.should.be.inDOM;
			expect('input[name="account"]').to.be.visible
			expect(casper.getElementAttribute('input[name="account"]', 'placeholder')).to.equal('Username');

			'input[name="password"]'.should.be.inDOM;
			expect('input[name="password"]').to.be.visible
			expect(casper.getElementAttribute('input[name="password"]', 'placeholder')).to.equal('Password');
		});
	});

	it('Username输入框的表单验证', function(){

		casper.then(function(){	// 先排除密码输入框的验证干扰
			this.sendKeys('#input_login_password', '123456', {reset: true});
		});

		casper.then(function(){	// 测试输入留空
			this.sendKeys('#input_login_username', '', {reset: true});
			expect('small[data-bv-validator="notEmpty"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入留空
			this.sendKeys('#input_login_username', '$', {reset: true});
			expect('small[data-bv-validator="regexp"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度不够
			this.sendKeys('#input_login_username', 'k', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度超额
			this.sendKeys('#input_login_username', 'kazafffffffffffffffffffffffffffffffffffffffffffffffffffffffff', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度合法
			this.sendKeys('#input_login_username', 'kazaff', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.not.be.visible;
			expect('#btn_login_sign').to.not.have.attr('disabled');
		});
	});

	it('Password输入框的表单验证', function(){
		casper.then(function(){	// 先排除帐号输入框的验证干扰
			this.sendKeys('#input_login_username', 'kazaff', {reset: true});
		});

		casper.then(function(){	// 测试输入留空
			this.sendKeys('#input_login_password', '', {reset: true});
			expect('small[data-bv-validator="notEmpty"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度不够
			this.sendKeys('#input_login_password', 'k', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度超额
			this.sendKeys('#input_login_password', 'kazafffffffffffffffffffffffffffffffffffffffffffffffffffffffff', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.be.visible;
			expect(casper.getElementAttribute('#btn_login_sign', 'disabled')).to.equal('disabled');
		});

		casper.then(function(){	// 测试输入长度合法
			this.sendKeys('#input_login_password', 'kazafff', {reset: true});
			expect('small[data-bv-validator="stringLength"]').to.not.be.visible;
			expect('#btn_login_sign').to.not.have.attr('disabled');
		});
	});

	it('登录成功验证', function(){
		// 这里取巧一下，由于上一个测试完毕后表单状态刚好处于可以提交
		casper.then(function(){
			this.click('#btn_login_sign');
			this.wait(100, function(){
				expect('#username').to.have.text('kazaff');
				expect('welcome').to.matchTitle;
				expect(/welcome\.html/).to.matchCurrentUrl;
			});
		});
	});

	//=========用来辅助写测试用例，可以实时反馈页面的状态=========
	// it('Test截屏', function(){
	// 	casper.then(function(){
	// 		this.wait(1, function() {
	// 			this.userAgent('Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36');
	// 			this.viewport(1024, 768);
	// 			this.capture('test.png');
	// 		});
	// 	});
	// });
});
