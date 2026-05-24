const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://odirmtmompghjgmhotml.supabase.co'
const supabaseKey = 'sb_publishable_60Fl-nhRPO7Mhd50BSLvdA_3eLie2s6'

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestUser() {
  const testEmail = 'admin@gestantes.com'
  const testPassword = 'Admin@123456'

  console.log('🚀 Criando usuário de teste...')
  console.log(`📧 Email: ${testEmail}`)
  console.log(`🔐 Senha: ${testPassword}`)
  console.log('---')

  try {
    // Signup
    console.log('1️⃣ Criando conta no Supabase Auth...')
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('⚠️ Usuário já existe!')
        console.log('Tentando fazer login...')

        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        })

        if (loginError) {
          console.error('❌ Erro ao fazer login:', loginError.message)
          return
        }

        console.log('✅ Login bem-sucedido!')
        console.log('ID:', loginData.user?.id)
        return
      }

      console.error('❌ Erro ao criar usuário:', signUpError.message)
      return
    }

    if (!authData.user?.id) {
      console.error('❌ Erro: Sem ID de usuário')
      return
    }

    console.log('✅ Conta criada no Auth!')
    console.log(`   ID: ${authData.user.id}`)

    // Cria perfil do usuário
    console.log('2️⃣ Criando perfil no banco de dados...')
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: testEmail,
        name: 'Administrador',
        week: 22,
        healthy_pregnancy: true,
        had_intercurrence: false,
        doctor_approved: true,
        objectives: ['preparar-para-parto'],
        discomforts: ['dor-lombar']
      })

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError.message)
      return
    }

    console.log('✅ Perfil criado com sucesso!')
    console.log('\n' + '='.repeat(50))
    console.log('🎉 USUÁRIO PRONTO PARA TESTAR!')
    console.log('='.repeat(50))
    console.log(`📧 Email:    ${testEmail}`)
    console.log(`🔐 Senha:    ${testPassword}`)
    console.log('='.repeat(50))
    console.log('\n💡 Use essas credenciais em: http://localhost:3000')
  } catch (error) {
    console.error('❌ Erro geral:', error.message)
  }
}

createTestUser()
