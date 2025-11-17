if [ -n ${HTTP_PROXY} ] ; then 
  cat << EOF > .npmrc 
http_proxy=${HTTP_PROXY}
https_proxy=${HTTP_PROXY}
EOF
fi
