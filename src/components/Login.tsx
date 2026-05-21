import React from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div id="pg-login">
      <div className="lw">
        <div className="ll">
          <div className="ll-in">
            <div className="ll-ico">🎓</div>
            <div className="ll-fac">Faculty of Engineering · KKU HR System</div>
            <div className="ll-title">ระบบบริหารสมรรถนะ<br />และแผนพัฒนารายบุคคล</div>
            <div className="ll-sub">Competency & IDP Management System</div>
          </div>
        </div>
        <div className="lr">
          <div className="lr-title">เข้าสู่ระบบ</div>
          <div className="lr-sub">ใช้บัญชี KKU Account ของท่าน</div>
          <div className="fg">
            <label className="lbl">รหัสผู้ใช้งาน</label>
            <input className="inp" defaultValue="somchai@kku.ac.th" />
          </div>
          <div className="fg">
            <label className="lbl">รหัสผ่าน</label>
            <input className="inp" type="password" defaultValue="••••••••" />
          </div>
          <button className="sso-btn" onClick={onLogin}>เข้าสู่ระบบ ด้วย KKU SSO →</button>
          <div className="hint">
            ระบบเชื่อมต่อ Single Sign-On มหาวิทยาลัยขอนแก่น<br />
            ปัญหาการเข้าใช้งาน ติดต่อ งานทรัพยากรบุคคลคณะ
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
