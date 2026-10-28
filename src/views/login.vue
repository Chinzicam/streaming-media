<template>
  <div class="login">
    <div class="login-box">
      <div class="title flex-between">欢迎登录系统</div>
      <el-form class="login-form" ref="formRef" :model="form" :rules="Rules" @keyup.enter="Login(formRef)">
        <el-form-item prop="LoginName">
          <el-input v-model="form.LoginName" clearable :placeholder="`请输入账户`"
            ><template #prefix><i class="iconfont icon-user" /></template
          ></el-input>
        </el-form-item>
        <el-form-item prop="Pwd">
          <el-input v-model="form.Pwd" show-password clearable placeholder="请输入密码"
            ><template #prefix><i class="iconfont icon-password" /></template
          ></el-input>
        </el-form-item>
      </el-form>
      <el-button type="primary" class="login-btn" :loading="syncLoading" @click="Login(formRef)"> 登录 </el-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { FormInstance, ElMessage } from "element-plus";
import { localStg } from "@/scripts/store";
import { configuredUsers } from "@/config/auth";

const route = useRoute();
const router = useRouter();
const formRef = ref<FormInstance>();
/** 表单 */
const form = reactive({
  LoginName: "",
  Pwd: "",
  KeepTime: 0
});

/** 是否正在登录 */
const syncLoading = ref(false);
/** 表单校验规则 */
const Rules = reactive({
  LoginName: [
    {
      required: true,
      trigger: "blur",
      message: "账号不能为空"
    }
  ],
  Pwd: [
    {
      required: true,
      trigger: "blur",
      message: "密码不能为空"
    }
  ]
});
const Login = (formEl: FormInstance | undefined) => {
  formEl?.validate((valid: boolean) => {
    if (valid) {
      const user = configuredUsers.find((item) => item.username === form.LoginName && item.password === form.Pwd);
      if (!user) {
        ElMessage.error("账号或密码错误");
        return;
      }

      localStg.set("userInfo", JSON.stringify({ userName: user.username }));
      window.dispatchEvent(new Event("user-info-changed"));
      const redirect = route.query.redirect;
      const target = typeof redirect === "string" && redirect.startsWith("/") ? redirect : "/dashboard";
      router.push(target === "/login" ? "/dashboard" : target);
    }
  });
};
</script>

<style lang="scss" scoped>
.login {
  position: relative;
  width: 100%;
  height: 100vh;
  background: url("@/assets/img/login_bg.png") no-repeat;
  background-size: cover;

  .login-box {
    position: absolute;
    top: 200px;
    right: 220px;
    width: 420px;
    height: 520px;
    background: #ffffff;
    box-shadow: 0px 3px 5px 0px rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    padding: 0 45px;
    box-sizing: border-box;

    .title {
      display: flex;
      justify-content: center;
      font-size: 24px;
      color: $main-text-color;
      line-height: 1;
      margin-top: 65px;
    }

    :deep(.login-form) {
      margin-top: 46px;

      .el-form-item {
        margin-bottom: 20px;
      }

      .item-code {
        margin-bottom: 10px;

        .el-input {
          width: 200px;
        }

        .code-img {
          margin-left: 10px;
          width: 120px;
          height: 48px;
        }
      }

      .el-checkbox {
        height: 14px;
        line-height: 1;
        color: $sub-text-color;
      }

      .el-input {
        border: none;

        .el-input__wrapper {
          height: 46px;
          line-height: 46px;
          box-shadow: none;
          background-color: #f3f5f7;
          border-radius: 2px;
          padding: 1px 11px 1px 20px;

          .el-input__prefix-inner > :last-child {
            margin-right: 20px;
          }

          .el-input__inner {
            color: $text-color;
            font-size: $normal-size;
          }

          /* 谷歌 */
          .el-input__inner::-webkit-input-placeholder {
            color: $text-color;
          }

          /* 火狐 */
          .el-input__inner:-moz-placeholder {
            color: $text-color;
          }

          /*ie*/
          .el-input__inner:-ms-input-placeholder {
            color: $text-color;
          }
        }

        .iconfont {
          color: $text-color;
        }
      }
    }

    .login-btn {
      width: 100%;
      height: 46px;
      border-radius: 2px;
      margin-top: 16px;
    }
  }
}
</style>
