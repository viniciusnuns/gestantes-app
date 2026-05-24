import { supabase } from './lib/supabase'

async function createTestUser() {
  const testEmail = 'admin@gestantes.com'
  const testPassword = 'Admin@123456'

  console.log('Criando usuário de teste...')
  console.log(`Email: ${testEmail}`)
  console.log(`Senha: ${testPassword}`)

  try {
    // Sign up
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    })

    if (signUpError) {
      console.error('Erro ao criar usuário:', signUpError)
      return
    }

    console.log('✅ Usuário criado no Supabase Auth!')
    console.log('ID:', authData.user?.id)

    if (!authData.user?.id) {
      console.error('Erro: Sem ID de usuário')
      return
    }

    // Cria perfil do usuário
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
      console.error('Erro ao criar perfil:', profileError)
      return
    }

    console.log('✅ Perfil criado com sucesso!')
    console.log('\n📧 Credenciais para testar:')
    console.log(`   Email: ${testEmail}`)
    console.log(`   Senha: ${testPassword}`)
  } catch (error) {
    console.error('Erro geral:', error)
  }
}

createTestUser()
