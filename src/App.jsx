import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import CourtFeesPage from './pages/CourtFeesPage'
import ArbitrationPage from './pages/ArbitrationPage'
import RateTablePage from './pages/RateTablePage'
import feesCourtfeesFull from './assets/fees_courtfees_full_nologo.png'
import feesArbitration from './assets/fees_arbitration.png'
import feesArbitrationSp from './assets/fees_arbitration_sp.png'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courtfees" element={<CourtFeesPage />} />
          <Route path="/arbitration" element={<ArbitrationPage />} />
          <Route
            path="/courtfees-table"
            element={
              <RateTablePage
                title="ตารางอัตราค่าธรรมเนียมศาล"
                images={[{ src: feesCourtfeesFull, alt: 'ตารางอัตราค่าธรรมเนียมศาล' }]}
              />
            }
          />
          <Route
            path="/arbitration-table"
            element={
              <RateTablePage
                title="ตารางอัตราค่าป่วยการ"
                images={[
                  { src: feesArbitration, alt: 'อัตราค่าป่วยการอนุญาโตตุลาการ' },
                  { src: feesArbitrationSp, alt: 'อัตราค่าป่วยการอนุญาโตตุลาการ แบบเร่งรัด' },
                ]}
              />
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
