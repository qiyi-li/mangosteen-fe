import {defineComponent, PropType, reactive, ref} from 'vue';
import {MainLayout} from '../../components/Layouts/MainLayout';
import {Button} from '../../shared/Button/Button';
import {Form, FormItem} from '../../shared/Form/Form';
import {Icon} from '../../shared/Icon/Icon';
import s from './SignIn.module.scss';
import axios from 'axios';
import {validate} from '../../shared/validate';
import {http} from '../../shared/HttpClient';

export const SignIn = defineComponent({
  props: {
    name: {
      type: String as PropType<string>
    }
  },
  setup(props, context) {
    const refValidationCode = ref<any>();
    const formData = reactive({
      email: '',
      code: '',
    });
    const errors = reactive({
      email: [],
      code: []
    });
    const judgeEmail = () => {
      errors.email = [];
      Object.assign(errors, validate([
        {key: 'email', type: 'required', value: true},
        {key: 'email', type: 'pattern', value: /.+@.+/, message: '输入正确的邮箱地址'},
      ], formData));
      return errors.email.join('');
    };
    const onSubmit = (e: Event) => {
      Object.assign(errors, {
        email: [], code: []
      });
      Object.assign(errors, validate([
        {key: 'email', type: 'required', value: true},
        {key: 'email', type: 'pattern', value: /.+@.+/, message: '输入正确的邮箱地址'},
        {key: 'code', type: 'required', value: true},
      ], formData));
      console.log(1111, errors, formData);
    };
    const sendValidationCode = async () => {
      console.log('send');
      const response = await http.post('/validation_codes', {email: formData.email}).catch((e: any) => {
        if (e.response.status === 422) {
          Object.assign(errors, e.response.data.errors);
        }
        throw e
      });
      console.log({response});
      refValidationCode.value.startCount();
    };

    return () => (
      <MainLayout>{
        {
          title: () => '登录',
          icon: () => <Icon name="left"/>,
          main: () => <div class={s.wrapper}>
            <div class={s.logo}>
              <Icon name="mangosteen" class={s.icon}/>
              <h1>山竹记账</h1>
            </div>
            <Form onSubmit={onSubmit}>
              <FormItem label="邮箱地址" type="text"
                        placeholder="请输入邮箱，然后点击发送验证码"
                        v-model={formData.email} error={errors.email?.[0]}/>
              <FormItem onClick={sendValidationCode} judge={judgeEmail} label="验证码" type="validationCode"
                        ref={refValidationCode}
                        placeholder="请输入六位数字"
                        v-model={formData.code} error={errors.code?.[0]}/>
              <FormItem style={{paddingTop: '96px'}}>
                <Button type={'submit'}>登录</Button>
              </FormItem>
            </Form>
          </div>
        }}</MainLayout>
    );
  }
});
