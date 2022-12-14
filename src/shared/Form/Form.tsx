import {computed, defineComponent, PropType, ref, VNode} from 'vue';
import {DatetimePicker, Popup} from 'vant';
import {Time} from '../time';
import {EmojiSelect} from '../EmojiSelect/EmojiSelect';
import s from './Form.module.scss';
import dayjs from 'dayjs';
import {Button} from '../Button/Button';
import {FunnelChart} from 'echarts/charts';

export const Form = defineComponent({
  props: {
    onSubmit: {
      type: Function as PropType<(e: Event) => void>,
    }
  },
  setup: (props, context) => {
    return () => (
      <form class={s.form} onSubmit={props.onSubmit}>
        {context.slots.default?.()}
      </form>
    );
  }
});

export const FormItem = defineComponent({
  props: {
    label: {
      type: String
    },
    modelValue: {
      type: [String, Number]
    },
    type: {
      type: String as PropType<'text' | 'emojiSelect' | 'date' | 'validationCode' | 'select'>,
    },
    error: {
      type: String
    },
    placeholder: String,
    options: Array as PropType<Array<{ value: string, text: string }>>,
    onClick: Function as PropType<() => void>,
    countForm: {
      type: Number,
      default: 60
    },
    judge: {
      type: Function as PropType<() => void>
    }
  },
  emits: ['update:modelValue'],
  setup: (props, context) => {
    const refDateVisible = ref(false);
    const timer = ref<number>();
    const count = ref<number>(props.countForm);
    const isCounting = computed(() => !!timer.value);
    const onClickSendCode = () => {
      const err = props.judge?.();
      if (!err) props.onClick?.()
    };
    const startCount = ()=>{
      timer.value = setInterval(() => {
        count.value -= 1;
        if (count.value === 0) {
          clearInterval(timer.value);
          timer.value = undefined;
          count.value = props.countForm || 60;
        }
      }, 1000);
    }
    context.expose({startCount})
    const content = computed(() => {
      switch (props.type) {
        case 'text':
          return <input
            placeholder={props.placeholder}
            value={props.modelValue}
            onInput={(e: any) => context.emit('update:modelValue', e.target.value)}
            class={[s.formItem, s.input, props.error && s.error]}/>;
        case 'emojiSelect':
          return <EmojiSelect
            v-model:sign={props.modelValue}
            onUpdateModelValue={value => {
              context.emit('update:modelValue', value);
            }}
            class={[s.formItem, s.emojiList, props.error && s.error]}/>;
        case 'date':
          return <>
            <input readonly={true} value={props.modelValue}
                   placeholder={props.placeholder}
                   onClick={() => { refDateVisible.value = true; }}
                   class={[s.formItem, s.input, props.error && s.error]}
            />
            <Popup position="bottom" close-on-click-overlay={false} v-model:show={refDateVisible.value}>
              <DatetimePicker value={new Date(props.modelValue || '')} type="date" title="???????????????"
                              onConfirm={(date: Date) => {
                                context.emit('update:modelValue', new Time(date).format());
                                refDateVisible.value = false;
                              }}
                              onCancel={() => refDateVisible.value = false}/>
            </Popup>
          </>;
        case 'validationCode':
          return <>
            <input class={[s.formItem, s.input, s.validationCodeInput]}
                   placeholder={props.placeholder}/>
            <Button disabled={!!timer.value} onClick={onClickSendCode}
                    class={[s.formItem, s.button, s.validationCodeButton]}>
              {isCounting.value ? `${count.value} ???????????????` : '???????????????'}
            </Button>
          </>;
        case 'select':
          return <select class={[s.formItem, s.select]} value={props.modelValue}
                         onChange={(e: any) => { context.emit('update:modelValue', e.target.value); }}>
            {props.options?.map(option =>
              <option value={option.value}>{option.text}</option>
            )}
          </select>;
        case undefined:
          return context.slots.default?.();
      }
    });
    return () => {
      return <div class={s.formRow}>
        <label class={s.formLabel}>
          {props.label &&
            <span class={s.formItem_name}>{props.label}</span>
          }
          <div class={s.formItem_value}>
            {content.value}
          </div>
          <div class={s.formItem_errorHint}>
            <span>{props.error ?? '???'}</span>
          </div>
        </label>
      </div>;
    };
  }
});
